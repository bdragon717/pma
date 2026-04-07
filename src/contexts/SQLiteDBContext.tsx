/**
 * SQLite DB Context
 */

import {
    AlarmData,
    AuthCheckData,
    AuthData,
    AuthEmptyCheckData,
    DBContextType,
    DocumentData,
    FolderData,
    FolderIdRow,
    PictureData,
    PmmasterData,
    RememberListData,
    ScheduleData,
    ScheduleFormData,
    ScheduleListData,
    SecretListData,
    UserCheckData,
    UserData
} from '@/src/utils/types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const DBContext = createContext<DBContextType | null>(null);

export const DBProvider: React.FC<{ children: React.ReactNode}> = ({ children }) => {
    const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);
    const [ready, setReady] = useState(false); // DB Open 여부
    
    useEffect(() => {
      // 마운트 상태 추적
      // 비동기 작업 도중 컴포넌트가 언마운트되는 경우 발생할 수 있는 메모리 누수 문제를 해결
      let isMounted = true;
      let dbIns: SQLite.SQLiteDatabase; // 연결 인스턴스를 추적할 변수 추가      
      const DATABASE_VERSION = 1; // 개발자가 정한 현재 앱의 타겟 DB 버전(현재 앱이 요구하는 DB 버전)

      const initDB = async () => {
        // 이미 DB 연결이 존재하면 초기화 중복 방지
        if (dbRef.current) return; 

        try {
            // DB 열기 (useNewConnection 제거로 안정성 확보)
            dbIns = await SQLite.openDatabaseAsync("pmdb.db", { useNewConnection: true }); // 매번 DB Open
            console.log("pmdb.db Open Complete");            

            if (dbIns) { 
              // TABLE CREATE AND Migrations
              // 현재 DB 버전 확인 (PRAGMA user_version)
              const result = await dbIns.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
              const currentVersion = result?.user_version ?? 0;
              console.log(`Current DB Version: ${currentVersion}`);

              if (currentVersion < DATABASE_VERSION) {
                await dbIns.withTransactionAsync(async () => {
                    if (currentVersion < 1) {
                      await dbIns.execAsync(`
                        CREATE TABLE IF NOT EXISTS pmmaster (
                          pmid TEXT PRIMARY KEY NOT NULL,
                          kind TEXT,
                          year INTEGER,
                          month INTEGER,
                          day INTEGER,
                          title TEXT,
                          contents TEXT,
                          folderId INTEGER
                        );
                        CREATE TABLE IF NOT EXISTS schedule (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          pmid TEXT,
                          complete TEXT,
                          contents TEXT
                        );
                        CREATE TABLE IF NOT EXISTS picture (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          pmid TEXT,
                          uri TEXT
                        );
                        CREATE TABLE IF NOT EXISTS document (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          pmid TEXT,
                          name TEXT,
                          size INTEGER,
                          uri TEXT,
                          mimeType TEXT,
                          createdAt INTEGER,
                          lastModified INTEGER
                        );
                        CREATE TABLE IF NOT EXISTS authentication (
                          authkey TEXT PRIMARY KEY NOT NULL,
                          errorcount INTEGER
                        );
                        CREATE TABLE IF NOT EXISTS alarms (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          pmid TEXT,
                          title TEXT,
                          year INTEGER,
                          month INTEGER,
                          day INTEGER,
                          hour INTEGER,
                          minute INTEGER,
                          repeat INTEGER,        -- 0: 한번, 1: 매일
                          isEnabled INTEGER,     -- 0: OFF, 1: ON
                          notificationId TEXT
                        );
                        CREATE TABLE IF NOT EXISTS folders (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          kind TEXT,
                          name TEXT,
                          parentId INTEGER,  -- null이면 최상위 폴더, 무한 depth 폴더 가능
                          sortOrder INTEGER, -- 드래그 정렬 가능
                          createdAt TEXT
                        );
                        CREATE TABLE IF NOT EXISTS users (
                          userid TEXT PRIMARY KEY NOT NULL,
                          password TEXT,
                          name TEXT,  
                          telno TEXT, 
                          changepwdate TEXT,
                          errorcount INTEGER
                        );
                        PRAGMA user_version = 1;
                      `);
                       console.log("Migration: Version 0 -> 1 (CREATE TABLE Complete)");
                    }
                    if (currentVersion < 2) {
                        // await dbIns.execAsync(`
                        //   추후 버전 2 로직 추가
                        //   PRAGMA user_version = 2;
                        // `);
                        // console.log("Migration: Version 1 -> 2 (ALTER TABLE Complete)");
                    }
                });
              }

              if (isMounted) {
                  dbRef.current = dbIns;
                  setReady(true);
              } else {
                 // 마운트 해제 후 연결이 완료되었다면 닫아주기
                 await dbIns.closeAsync();
              }
            }
        } catch (error) {
            if (isMounted) {
                console.error('DataBase Open 오류:', error);
            }
            //return undefined;
            // 오류 발생 시 연결이 열려있다면 닫아주는 것이 안전함
            if (dbIns) {
                await dbIns.closeAsync(); 
            }
        }
      };

      initDB();

      // 클린업 함수에서 isMounted 플래그 설정 및 DB 연결 종료
      return () => {
        isMounted = false; // 언마운트 시 상태 변경, 언마운트 상태를 알림
        if (dbRef.current) {
            // 컴포넌트 언마운트 시 DB 연결 종료
            //dbRef.current.closeAsync(); 
            dbRef.current = null;
        }
      };
    }, []);
    
    // ready 상태가 false일 때 null을 반환하는 대신, <div>DB 로딩 중...</div>을 반환하여 사용자에게 로딩 상태를 알리고, 
    // useDatabase 훅에서 null 컨텍스트에 접근하는 오류를 방지
    if (!ready) {
        console.log("DBProvider: DB 로딩 중...");
        return null;
    };

    //////////////////////////////////////////////////
    // rememberListSelect
    const rememberListSelectSql = async (kind: string,
                                         year?: string | null,
                                         month?: string | null,
                                         day?: string | null,
                                         title?: string | null,
                                         folderId?: number | undefined | null) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM pmmaster`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (kind !== undefined && kind !== null && kind !== "") {
                whereClauses.push(`kind = ?`);
                values.push(kind.trim());
            }
            if (year !== undefined && year !== null && year !== "") {
                whereClauses.push(`year = ?`);
                values.push(year);
            }
            if (month !== undefined && month !== null && month !== "") {
                whereClauses.push(`month = ?`);
                values.push(month);
            }
            if (day !== undefined && day !== null && day !== "") {
                whereClauses.push(`day = ?`);
                values.push(day);
            }
            if (title != undefined && title !== null && title !== "") {
                whereClauses.push(`title LIKE ?`);
                values.push('%'+title.trim()+'%');
            }
            if (folderId !== undefined) {
                if (folderId === null) {
                    whereClauses.push(`folderId IS NULL`);                
                } else {
                    whereClauses.push(`folderId = ?`);
                    values.push(folderId);
                }
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            baseQuery += ` ORDER BY printf('%04d-%02d-%02d', year, month, day) DESC`;
            //baseQuery += ` ORDER BY year, month, day DESC`;

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as RememberListData[];        
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; // 타입 안정성 향상
        }        
    };

    // scheduleListSelect
    const scheduleListSelectSql = async (kind: string,
                                         year?: string | null,
                                         month?: string | null,
                                         day?: string | null,
                                         complete?: string | null) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `
                            SELECT A.*,
                                   CASE WHEN A.complete = 'N' THEN '미완료'
                                        ELSE '완료'
                                   END AS completion
                             FROM (SELECT A.*,
                                          CASE WHEN COUNT(B.pmid) > 0 THEN 'N'
                                               ELSE 'S'
                                          END AS complete
                                     FROM pmmaster A LEFT JOIN schedule B
                                       ON A.pmid = B.pmid AND B.complete = 'N'
                                     GROUP BY A.pmid) A
                            `;
            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (kind !== undefined && kind !== null && kind !== "") {
                whereClauses.push(`A.kind = ?`);
                values.push(kind.trim());
            }
            if (year !== undefined && year !== null && year !== "") {
                whereClauses.push(`A.year = ?`);
                values.push(year);
            }
            if (month !== undefined && month !== null && month !== "") {
                whereClauses.push(`A.month = ?`);
                values.push(month);
            }
            if (day !== undefined && day !== null && day !== "") {
                whereClauses.push(`A.day = ?`);
                values.push(day);
            }
            if (complete !== undefined && complete !== null && complete !== "" && complete !== "A") {
                whereClauses.push(`A.complete = ?`);
                values.push(complete.trim());
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            baseQuery += ` ORDER BY printf('%04d-%02d-%02d', A.year, A.month, A.day)`;
            //baseQuery += ` ORDER BY A.year, A.month, A.day DESC`;

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as ScheduleListData[];        
        } catch (error) {
            console.error('selectSql 오류:', error);
            return [];
        }        
    };

    // secretListSelect
    const secretListSelectSql = async (kind: string,
                                       title?: string | null,
                                       folderId?: number | undefined | null) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM pmmaster`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (kind !== undefined && kind !== null && kind !== "") {
                whereClauses.push(`kind = ?`);
                values.push(kind.trim());
            }            
            if (title != undefined && title !== null && title !== "") {
                whereClauses.push(`title LIKE ?`);
                values.push('%'+title.trim()+'%');
            }
            if (folderId !== undefined) {
                if (folderId === null) {
                    whereClauses.push(`folderId IS NULL`);                
                } else {
                    whereClauses.push(`folderId = ?`);
                    values.push(folderId);
                }
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            baseQuery += ` ORDER BY printf('%04d-%02d-%02d', year, month, day) DESC`;
            //baseQuery += ` ORDER BY year, month, day DESC`;

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as SecretListData[];  
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };

    // Auth Empty Check
    const authEmptyCheckSql = async () => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT EXISTS (SELECT 1 
                                              FROM authentication
                                           ) AS isEmpty`;
            const row = await dbRef.current.getFirstAsync(baseQuery);
            return row as AuthEmptyCheckData;        
        } catch (error) {
            console.error('selectSql 오류:', error);
            return undefined; 
        }        
    };

    // Auth Check
    const authCheckSql = async (authkey: string) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT EXISTS (SELECT 1 
                                              FROM authentication 
                                             WHERE authkey = ? 
                                             LIMIT 1
                                           ) AS isExist`; 
            const row = await dbRef.current.getFirstAsync(baseQuery, authkey);
            return row as AuthCheckData;           
        } catch (error) {
            console.error('selectSql 오류:', error);
            return undefined;
        }        
    };

    //////////////////////////////////////////////////
    // pmmasterSelect
    const pmmasterSelectSql = async (pmid: string | null,
                                     kind: string | null) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM pmmaster`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (pmid !== undefined && pmid !== null && pmid !== "") {
                whereClauses.push(`pmid = ?`);
                values.push(pmid.trim());
            }
            if (kind !== undefined && kind !== null && kind !== "") {
                whereClauses.push(`kind = ?`);
                values.push(kind.trim());
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as PmmasterData[];
            // unknown[] 타입의 결과를 PmmasterData[]으로 변환 (타입 단언 또는 런타임 검사 필요)
            // SQLite의 결과 타입은 unknown[]이므로, PmmasterData[]으로 타입 단언            
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; // 타입 안정성 향상
        }        
    };
    
    // pmmasterInsert
    const pmmasterInsertSql = async (pmid: string,
                                     kind: string | null,
                                     year: string | null,
                                     month: string | null,
                                     day: string | null,
                                     title: string | null,
                                     contents: string | null,
                                     folderId: number | null) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'INSERT INTO pmmaster (pmid, kind, year, month, day, title, contents, folderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [pmid, kind, year, month, day, title, contents, folderId]
            );
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; // 오류를 다시 던져서 Promise<void>를 유지
        }        
    };

    // pmmasterUpdate
    const pmmasterUpdateSql = async (pmid: string,
                                     title?: string | null,
                                     contents?: string | null,
                                     folderId?: number | undefined | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (title !== undefined && title !== null && title !== "") {
                sets.push(`title = ?`);
                values.push(title.trim());
            }
            if (contents !== undefined && contents !== null && contents !== "") {
                sets.push(`contents = ?`);
                values.push(contents.trim());
            }
            if (folderId !== undefined) {
                sets.push(`folderId = ?`);
                values.push(folderId);
            }
            values.push(pmid);

            await dbRef.current.runAsync(
              `UPDATE pmmaster SET ${sets.join(", ")} WHERE pmid = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; // 오류를 다시 던져서 Promise<void>를 유지
        }        
    };

    // pmmasterDelete
    const pmmasterDeleteSql = async (pmid: string) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM pmmaster WHERE pmid = ?',
                [pmid]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; // 오류를 다시 던져서 Promise<void>를 유지
        }
    };

    // pmmasterMultiDelete
    const pmmasterMultiDeleteSql = async (selectedIds: string[]) => {
        if (!dbRef.current) return;
        try {
            // SQL IN 절에 사용할 플레이스홀더 (?, ?, ?, ...) 생성
            const placeholders = selectedIds.map(() => '?').join(', ');   
            // SQL 쿼리: id를 기준으로 삭제
            const deleteQuery = `DELETE FROM pmmaster WHERE pmid IN (${placeholders});`;
            await dbRef.current.runAsync(deleteQuery, selectedIds);
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    //////////////////////////////////////////////////
    // scheduleSelect
    const scheduleSelectSql = async (pmid: string) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM schedule`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (pmid !== undefined && pmid !== null && pmid !== "") {
                whereClauses.push(`pmid = ?`);
                values.push(pmid.trim());
            }            
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as ScheduleData[];         
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };
    
    // scheduleInsert
    const scheduleInsertSql = async (pmid: string,
                                     complete: string | null,
                                     contents: ScheduleFormData[]) => {
        if (!dbRef.current) return;

        try {
            for (const content of contents) {
                await dbRef.current.runAsync(
                  'INSERT INTO schedule (pmid, complete, contents) VALUES (?, ?, ?)',
                  [pmid, complete, content.contents]
                );
            };
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // scheduleUpdate
    const scheduleUpdateSql = async (id: number,
                                     complete?: string | null,
                                     contents?: string | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (complete !== undefined && complete !== null && complete !== "") {
                sets.push(`complete = ?`);
                values.push(complete.trim());
            }
            if (contents !== undefined && contents !== null && contents !== "") {
                sets.push(`contents = ?`);
                values.push(contents.trim());
            }
            values.push(id);

            await dbRef.current.runAsync(
              `UPDATE schedule SET ${sets.join(", ")} WHERE id = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // scheduleDelete
    const scheduleDeleteSql = async (id: number) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM schedule WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    // scheduleMultiDelete
    const scheduleMultiDeleteSql = async (selectedIds: string[]) => {
        if (!dbRef.current) return;
        try {
            // SQL IN 절에 사용할 플레이스홀더 (?, ?, ?, ...) 생성
            const placeholders = selectedIds.map(() => '?').join(', ');   
            // SQL 쿼리: id를 기준으로 삭제
            const deleteQuery = `DELETE FROM schedule WHERE pmid IN (${placeholders});`;
            await dbRef.current.runAsync(deleteQuery, selectedIds);
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    //////////////////////////////////////////////////
    // pictureSelect
    const pictureSelectSql = async (pmid: string) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM picture`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (pmid !== undefined && pmid !== null && pmid !== "") {
                whereClauses.push(`pmid = ?`);
                values.push(pmid.trim());
            }            
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as PictureData[];         
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };
    
    // pictureInsert
    const pictureInsertSql = async (pmid: string | null,
                                    uris: ImagePicker.ImagePickerAsset[]) => {
        if (!dbRef.current) return;
        try {            
            //const values = uri.map(() => '(?, ?)').join(',');
            //const params = uri.flatMap(uri => [uri.uri]);    
            for (const uri of uris) {
                await dbRef.current.runAsync(
                  'INSERT INTO picture (pmid, uri) VALUES (?, ?)',
                  [pmid, uri.uri]
                );
            };
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // pictureUpdate
    const pictureUpdateSql = async (id: number,
                                    uri?: string | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (uri !== undefined && uri !== null && uri !== "") {
                sets.push(`uri = ?`);
                values.push(uri.trim());
            }
            values.push(id);

            await dbRef.current.runAsync(
              `UPDATE picture SET ${sets.join(", ")} WHERE id = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // pictureDelete
    const pictureDeleteSql = async (idsToDelete: number[]) => {
        if (!dbRef.current) return;
        try {
            // SQL IN 절에 사용할 플레이스홀더 (?, ?, ?, ...) 생성
            const placeholders = idsToDelete.map(() => '?').join(', ');   
            // SQL 쿼리: id를 기준으로 삭제
            const deleteQuery = `DELETE FROM picture WHERE id IN (${placeholders});`;
            await dbRef.current.runAsync(deleteQuery, idsToDelete);
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    // pictureSingleDelete
    const pictureSingleDeleteSql = async (pmid: string) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM picture WHERE pmid = ?',
                [pmid]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; // 오류를 다시 던져서 Promise<void>를 유지
        }
    };

    //////////////////////////////////////////////////
    // documentSelect
    const documentSelectSql = async (pmid: string) => {
        if (!dbRef.current) return [];
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM document`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (pmid !== undefined && pmid !== null && pmid !== "") {
                whereClauses.push(`pmid = ?`);
                values.push(pmid.trim());
            }            
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as DocumentData[];         
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };
    
    // documentInsert
    const documentInsertSql = async (pmid: string,
                                     docs: DocumentPicker.DocumentPickerAsset[]) => {
        if (!dbRef.current) return;
        try {
            for (const doc of docs) {
                await dbRef.current.runAsync(
                  'INSERT INTO document (pmid, name, size, uri, mimeType, createdAt, lastModified) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [
                    pmid, 
                    doc.name ?? 'unknown',         // 이름이 없을 경우 대비
                    doc.size ?? 0,                 // size가 undefined면 0 또는 null
                    doc.uri,                       // uri는 필수값이므로 그대로
                    doc.mimeType ?? null,          // undefined면 null로 변환
                    Date.now(),                    // createdAt (현재 시간)
                    doc.lastModified ?? Date.now() // 수정일 없으면 현재 시간
                  ]
                );
            };
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // documentUpdate
    const documentUpdateSql = async (id: number,
                                     lastModified?: string | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (lastModified !== undefined && lastModified !== null && lastModified !== "") {
                sets.push(`lastModified = ?`);
                values.push(lastModified.trim());
            }
            values.push(id);

            await dbRef.current.runAsync(
              `UPDATE document SET ${sets.join(", ")} WHERE id = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // documentDelete
    const documentDeleteSql = async (idsToDelete: number[]) => {
        if (!dbRef.current) return;
        try {
            // SQL IN 절에 사용할 플레이스홀더 (?, ?, ?, ...) 생성
            const placeholders = idsToDelete.map(() => '?').join(', ');   
            // SQL 쿼리: id를 기준으로 삭제
            const deleteQuery = `DELETE FROM document WHERE id IN (${placeholders});`;
            await dbRef.current.runAsync(deleteQuery, idsToDelete);
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    // documentSingleDelete
    const documentSingleDeleteSql = async (pmid: string) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM document WHERE pmid = ?',
                [pmid]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; // 오류를 다시 던져서 Promise<void>를 유지
        }
    };

    //////////////////////////////////////////////////
    // authSelect
    const authSelectSql = async (authkey?: string | null) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM authentication`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (authkey !== undefined && authkey !== null && authkey !== "") {
                whereClauses.push(`authkey = ?`);
                values.push(authkey.trim());
            }            
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }

            const row = await dbRef.current.getFirstAsync(baseQuery, values);
            return row as AuthData;         
        } catch (error) {
            console.error('selectSql 오류:', error);
            return undefined; 
        }        
    };
    
    // authInsert
    const authInsertSql = async (authkey: string | null) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'INSERT INTO authentication (authkey, errorcount) VALUES (?, ?)',
                [authkey, 0]
            );
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // authUpdate
    const authUpdateSql = async (authkey?: string | null,
                                 errorcount?: number | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (authkey !== undefined && authkey !== null && authkey !== "") {
                sets.push(`authkey = ?`);
                values.push(authkey.trim());
            }
            if (errorcount !== undefined && errorcount !== null) {
                sets.push(`errorcount = ?`);
                values.push(errorcount);
            }

            await dbRef.current.runAsync(
              `UPDATE authentication SET ${sets.join(", ")}`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // authDelete
    const authDeleteSql = async (authkey: string) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM authentication WHERE authkey = ?',
                [authkey]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    //////////////////////////////////////////////////
    // alarmSelect
    const alarmSelectSql = async (id?: number | undefined,
                                  isEnabled?: number | undefined,
                                  notificationId?: string | null,
                                  year?: string | null,
                                  month?: string | null,
                                  day?: string | null,
                                  hour?: string | null,
                                  minute?: string | null,
                                  title?: string | null) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM alarms`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (id !== undefined && id !== null) {
                whereClauses.push(`id = ?`);
                values.push(id);
            } 
            if (isEnabled !== undefined && isEnabled !== null) {
                whereClauses.push(`isEnabled = ?`);
                values.push(isEnabled);
            }
            if (notificationId !== undefined && notificationId !== null && notificationId !== "") {
                whereClauses.push(`notificationId = ?`);
                values.push(notificationId.trim());
            }
            if ((year !== undefined && year !== null && year !== "") &&
                (month !== undefined && month !== null && month !== "") &&
                (day !== undefined && day !== null && day !== "") &&
                (hour !== undefined && hour !== null && hour !== "") &&
                (minute !== undefined && minute !== null && minute !== "")) {
                //whereClauses.push(`(year * 10000 + month * 100 + day) > ?`);
                whereClauses.push(`(year * 100000000 + month * 1000000 + day * 10000 + hour * 100 + minute) > ?`);
                //const todayYMD = (Number(year ?? 0) * 10000) + (Number(month ?? 0) * 100) + Number(day ?? 0);
                const todayYMDHM = (Number(year) * 100000000) + 
                                   (Number(month) * 1000000) + 
                                   (Number(day) * 10000) + 
                                   (Number(hour) * 100) + 
                                    Number(minute);
                values.push(todayYMDHM);
            }
            if (title != undefined && title !== null && title !== "") {
                whereClauses.push(`title LIKE ?`);
                values.push('%'+title.trim()+'%');
            }     
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            baseQuery += ` ORDER BY title`;

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as AlarmData[];
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };
    
    // alarmInsert
    const alarmInsertSql = async (pmid: string,
                                  title: string | null,
                                  year: string | null,
                                  month: string | null,
                                  day: string | null,
                                  hour: string | null,
                                  minute: string | null,
                                  repeat: number | null,
                                  isEnabled: number | null,
                                  notificationId: string | null) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'INSERT INTO alarms (pmid, title, year, month, day, hour, minute, repeat, isEnabled, notificationId) VALUES (?, ?, ?, ?, ?, ? ,?, ?, ? ,?)',
                [pmid, title, year, month, day, hour, minute, repeat, isEnabled, notificationId]
            );
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // alarmUpdate
    const alarmUpdateSql = async (id: number,
                                  isEnabled?: number | undefined,
                                  notificationId?: string | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (isEnabled !== undefined && isEnabled !== null) {
                sets.push(`isEnabled = ?`);
                values.push(isEnabled);
            }
            if (notificationId !== undefined && notificationId !== null && notificationId !== "") {
                sets.push(`notificationId = ?`);
                values.push(notificationId.trim());
            }
            values.push(id);

            await dbRef.current.runAsync(
              `UPDATE alarms SET ${sets.join(", ")} WHERE id = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // alarmDelete
    const alarmDeleteSql = async (id: number) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM alarms WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    // alarmMultiDelete
    const alarmMultiDeleteSql = async (selectedIds: string[]) => {
        if (!dbRef.current) return;
        try {
            // SQL IN 절에 사용할 플레이스홀더 (?, ?, ?, ...) 생성
            const placeholders = selectedIds.map(() => '?').join(', ');   
            // SQL 쿼리: id를 기준으로 삭제
            const deleteQuery = `DELETE FROM alarms WHERE pmid IN (${placeholders});`;
            await dbRef.current.runAsync(deleteQuery, selectedIds);
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    //////////////////////////////////////////////////
    // folderSelect
    const folderSelectSql = async (kind?: string | null,
                                   id?: number | undefined | null,
                                   parentId?: number | undefined | null) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM folders`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (kind !== undefined && kind !== null && kind !== "") {
                whereClauses.push(`kind = ?`);
                values.push(kind.trim());
            }
            if (id !== undefined && id !== null) {
                whereClauses.push(`id = ?`);
                values.push(id);
            } 
            if (parentId !== undefined) {
                if (parentId === null) {
                    whereClauses.push(`parentId IS NULL`);                
                } else {
                    whereClauses.push(`parentId = ?`);
                    values.push(parentId);  
                }
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }
            baseQuery += ` ORDER BY name`;

            const rows = await dbRef.current.getAllAsync(baseQuery, values);
            return (rows || []) as FolderData[];
        } catch (error) {
            console.error('selectSql 오류:', error);
            return []; 
        }        
    };
    
    // folderInsert
    const folderInsertSql = async (kind: string | null,
                                   name: string | null,
                                   parentId: number | null,
                                   sortOrder: number | null,
                                   createdAt: string | null) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'INSERT INTO folders (kind, name, parentId, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?)',
                [kind, name, parentId, sortOrder, createdAt]
            );
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // folderUpdate
    const folderUpdateSql = async (id: number,
                                   name?: string,
                                   parentId?: number | null,
                                   sortOrder?: number | null,
                                   createdAt?: string) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (name !== undefined && name !== null && name !== "") {
                sets.push(`name = ?`);
                values.push(name.trim());
            }
            if (parentId !== undefined) {
                sets.push(`parentId = ?`);
                values.push(parentId);
            }
            if (sortOrder !== undefined && sortOrder !== null) {
                sets.push(`sortOrder = ?`);
                values.push(sortOrder);
            }
            if (createdAt !== undefined && createdAt !== null && createdAt !== "") {
                sets.push(`createdAt = ?`);
                values.push(createdAt.trim());
            }
            values.push(id);

            await dbRef.current.runAsync(
              `UPDATE folders SET ${sets.join(", ")} WHERE id = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // folderDelete
    const folderDeleteSql = async (id: number) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM folders WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    // folder & file Delete
    // 외래 키 설정: 만약 SQLite 테이블 생성 시 ON DELETE CASCADE 설정을 해두었다면, 
    // 위와 같은 복잡한 재귀 코드 없이 부모 폴더 하나만 지워도 하위 데이터가 자동으로 삭제됩니다.
    const deleteFolderRecursiveMultiSql = async (folderId: number) => {
      if (!dbRef.current) return;
    
      // 하위 폴더 조회
      const subFolders = await dbRef.current.getAllAsync<FolderIdRow>(
        `SELECT id FROM folders WHERE parentId = ?`,
        [folderId]
      );
    
      // 하위 폴더 먼저 삭제 (재귀 호출)
      for (const f of subFolders) {
        await deleteFolderRecursiveMultiSql(f.id);
      }
    
      // 현재 폴더에 속한 pmmaster들의 pmid 목록 조회
      const itemsToDelete = await dbRef.current.getAllAsync<{ pmid: string }>(
        `SELECT pmid FROM pmmaster WHERE folderId = ?`,
        [folderId]
      );
    
       await dbRef.current.withTransactionAsync(async () => {
         if (!dbRef.current) return;

         // 각 아이템(pmid)과 연결된 사진/문서/데이터 삭제
         for (const item of itemsToDelete) {
           // 물리적 파일 삭제 (사진 및 문서)
           await deletePhysicalFilesSql(item.pmid); 
           // DB 삭제
           // PICTURE 테이블 삭제
           await dbRef.current.runAsync(
             `DELETE FROM picture WHERE pmid = ?`,
             [item.pmid]
           );
           // DOCUMENT 테이블 삭제
           await dbRef.current.runAsync(
             `DELETE FROM document WHERE pmid = ?`,
             [item.pmid]
           );
           // PMMASTER(메인) 삭제
           await dbRef.current.runAsync(
             `DELETE FROM pmmaster WHERE pmid = ?`,
             [item.pmid]
           );
         }
       
         // 폴더 자체를 삭제
         await dbRef.current.runAsync(
           `DELETE FROM folders WHERE id = ?`,
           [folderId]
         );
       });
    };

    // 물리적 파일 삭제 (사진 및 문서)
    const deletePhysicalFilesSql = async (pmid: string) => {
      if (!dbRef.current) return;
    
      try {
        // PICTURE 테이블에서 경로 조회
        const pics = await dbRef.current.getAllAsync<{ uri: string }>(
          `SELECT uri FROM picture WHERE pmid = ?`, [pmid]
        );
        // DOCUMENT 테이블에서 경로 조회
        const docs = await dbRef.current.getAllAsync<{ uri: string }>(
          `SELECT uri FROM document WHERE pmid = ?`, [pmid]
        );
    
        // 실제 파일 삭제 실행 (사진 및 문서)
        const allFiles = [...pics, ...docs];
        await Promise.all(
          allFiles.map(async (file) => {
            if (file.uri) {
              const info = await FileSystem.getInfoAsync(file.uri);
              if (info.exists) {
                await FileSystem.deleteAsync(file.uri);
              }
            }
          })
        );
      } catch (error) {
        console.error("물리 파일 삭제 실패:", error);
      }
    };

    // folder & file Delete
    // 외래 키 설정: 만약 SQLite 테이블 생성 시 ON DELETE CASCADE 설정을 해두었다면, 
    // 위와 같은 복잡한 재귀 코드 없이 부모 폴더 하나만 지워도 하위 데이터가 자동으로 삭제됩니다.
    const deleteFolderRecursiveNormalSql = async (folderId: number) => {
      if (!dbRef.current) return;

      // 하위 폴더 조회
      const subFolders = await dbRef.current.getAllAsync<FolderIdRow>(
        `SELECT id FROM folders WHERE parentId = ?`,
        [folderId]
      );

      // 하위 폴더 먼저 삭제 (재귀)
      for (const f of subFolders) {
        await deleteFolderRecursiveNormalSql(f.id);
      }

      // 이 폴더에 속한 파일 삭제
      await dbRef.current.runAsync(
        `DELETE FROM pmmaster WHERE folderId = ?`,
        [folderId]
      );

      // 폴더 삭제
      await dbRef.current.runAsync(
        `DELETE FROM folders WHERE id = ?`,
        [folderId]
      );
    };

    //////////////////////////////////////////////////
    // self User Select
    const selfUserSelect = async (userid: string | null,
                                  name: string | null, 
                                  telno: string | null) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT EXISTS (SELECT 1 
                                              FROM users 
                                             WHERE userid = ? AND name = ? AND telno = ?
                                             LIMIT 1
                                           ) AS isExist`; 
            const row = await dbRef.current.getFirstAsync(baseQuery, userid, name, telno);
            return row as UserCheckData;           
        } catch (error) {
            console.error('selectSql 오류:', error);
            return undefined;
        }        
    };

    // userSelect
    const userSelectSql = async (userid?: string | null,
                                 name?: string | null,
                                 telno?: string | null) => {
        if (!dbRef.current) return;
        try {
            // SQL 및 변수 정의
            let baseQuery = `SELECT * FROM users`;            
            let whereClauses: string[] = [];
            let values: any[] = [];

            // 입력 항목 체크
            if (userid !== undefined && userid !== null && userid !== "") {
                whereClauses.push(`userid = ?`);
                values.push(userid.trim());
            }
            if (name !== undefined && name !== null && name !== "") {
                whereClauses.push(`name = ?`);
                values.push(name.trim());
            }
            if (telno !== undefined && telno !== null && telno !== "") {
                whereClauses.push(`telno = ?`);
                values.push(telno.trim());
            }
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(` AND `);
            }

            const row = await dbRef.current.getFirstAsync(baseQuery, values);
            return row as UserData;         
        } catch (error) {
            console.error('selectSql 오류:', error);
            return undefined; 
        }        
    };
    
    // userInsert
    const userInsertSql = async (userid: string | null,
                                 password: string | null,
                                 name: string | null,
                                 telno: string | null,
                                 changepwdate: string | null,
                                 errorcount: number | null) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'INSERT INTO users (userid, password, name, telno, changepwdate, errorcount) VALUES (?, ?, ?, ?, ?, ?)',
                [userid, password, name, telno, changepwdate, errorcount]
            );
        } catch (error) {
            console.error('insertSql 오류:', error);
            throw error; 
        }        
    };

    // userUpdate
    const userUpdateSql = async (userid: string | null,
                                 name: string | null,
                                 telno: string | null,
                                 password?: string | null,
                                 changepwdate?: string | null,
                                 errorcount?: number | null) => {
        if (!dbRef.current) return;
        try {
            let sets: string[] = [];
            let values: any[] = [];

            if (password !== undefined && password !== null && password !== "") {
                sets.push(`password = ?`);
                values.push(password.trim());
            }
            if (changepwdate !== undefined && changepwdate !== null && changepwdate !== "") {
                sets.push(`changepwdate = ?`);
                values.push(changepwdate.trim());
            }
            if (errorcount !== undefined && errorcount !== null) {
                sets.push(`errorcount = ?`);
                values.push(errorcount);
            }

            values.push(userid);
            values.push(name);
            values.push(telno);

            await dbRef.current.runAsync(
              `UPDATE users SET ${sets.join(", ")} WHERE userid = ? AND name = ? AND telno = ?`,
               values
            );
        } catch (error) {
            console.error('updateSql 오류:', error);
            throw error; 
        }        
    };

    // userDelete
    const userDeleteSql = async (userid: string) => {
        if (!dbRef.current) return;
        try {
            await dbRef.current.runAsync(
                'DELETE FROM users WHERE userid = ?',
                [userid]
            );
        } catch (error) {
            console.error('deleteSql 오류:', error);
            throw error; 
        }
    };

    //////////////////////////////////////////////////

    return (
        <DBContext.Provider value={{pmmasterSelectSql, 
                                    pmmasterInsertSql, 
                                    pmmasterUpdateSql, 
                                    pmmasterDeleteSql,
                                    scheduleSelectSql,
                                    scheduleInsertSql,
                                    scheduleUpdateSql,
                                    scheduleDeleteSql,
                                    pictureSelectSql,
                                    pictureInsertSql,
                                    pictureUpdateSql,
                                    pictureDeleteSql,
                                    pictureSingleDeleteSql,
                                    documentSelectSql,
                                    documentInsertSql,
                                    documentUpdateSql,
                                    documentDeleteSql,
                                    documentSingleDeleteSql,
                                    rememberListSelectSql,
                                    secretListSelectSql,
                                    scheduleListSelectSql,
                                    authEmptyCheckSql,
                                    authCheckSql,
                                    authSelectSql,
                                    authInsertSql,
                                    authUpdateSql,
                                    authDeleteSql,
                                    alarmSelectSql,
                                    alarmInsertSql,
                                    alarmUpdateSql,
                                    alarmDeleteSql,
                                    folderSelectSql,
                                    folderInsertSql,
                                    folderUpdateSql,
                                    folderDeleteSql,
                                    deleteFolderRecursiveMultiSql,
                                    deleteFolderRecursiveNormalSql,
                                    deletePhysicalFilesSql,
                                    pmmasterMultiDeleteSql,
                                    scheduleMultiDeleteSql,
                                    alarmMultiDeleteSql,
                                    selfUserSelect,
                                    userSelectSql,
                                    userInsertSql,
                                    userUpdateSql,
                                    userDeleteSql,
                                    dbRef
                                    }}>
            { children}
        </DBContext.Provider>
    );
};

export const useDatabase = () => {
    const ctx = useContext(DBContext);
    if (!ctx) {
      throw new Error ("useDatabase 후크는 DBProvider 내에서 사용해야 합니다.");
    }
    return ctx;
};
