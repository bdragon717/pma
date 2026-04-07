/*
 * SQLite의 초기(최초) PRAGMA user_version 값은 0, user_version = 0
 */

import * as SQLite from 'expo-sqlite';

// 개발자가 정한 현재 앱의 타겟 DB 버전(현재 앱이 요구하는 DB 버전)
const DATABASE_VERSION = 0;

// 데이터베이스 연결 인스턴스를 저장할 변수 (초기에는 null)
let db: SQLite.SQLiteDatabase | null = null;

export const runDatabaseMigrations = async () => {
  try {
    // 최신 비동기 방식으로 데이터베이스 열기
    db = await SQLite.openDatabaseAsync("pmdb.db");
    if (!db) {
      console.error("Database not initialized.");
      return;
    }  

    // 현재 DB 버전 조회 (runAsync/getAllAsync 등을 사용할 수 있지만 execAsync으로 PRAGMA 실행)
    // PRAGMA는 execAsync을 사용하거나, 간단한 쿼리는 runAsync를 사용할 수 있습니다.
    let currentVersion = 0; // 기본값 0 또는 적절한 초기값 설정
    const realVersion = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");  // SQLite 내부 스토리지에 기록된 실제 파일의 버전
    if (realVersion) {
      currentVersion = realVersion?.user_version ?? 0; // 실제 현재 버전 -  realVersion :  {"user_version": 0}
    } else {
      console.error("현재 DB 버전으로는 해결할 수 없습니다.");
      return;
    }

    // 마이그레이션 실행
    if (currentVersion < DATABASE_VERSION) { // 실제 현재 버전 < 현재 앱 요구 버전
      await applyMigrations(currentVersion); // 테이블 구조를 변경(ALTER TABLE)하여 버전을 맞춤
    } else {
      return;
    }
    
    // 마이그레이션이 완료된 후 DB 인스턴스를 반환하거나 전역적으로 사용 가능하게 설정
    return db; 
  } catch (error) {
    console.error("Database migration error:", error);
    // 오류 발생 시 적절한 처리 (예: 앱 종료 또는 오류 화면 표시)
    throw error;
  }
};

// 버전별 마이그레이션 실행 함수 (비동기 함수로 선언)
async function applyMigrations(currentVersion:number) {
  // Version migration
  if (currentVersion < 1) {    
    // execAsync은 여러 SQL 문장을 한 번에 실행하거나 PRAGMA 설정에 유용합니다.
    // DDL (CREATE, ALTER TABLE) 문은 트랜잭션 내에서 실행할 필요가 없습니다.
    // if (db) {
    //   const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(pmmaster);`); // 컬럼 조회
    //   const exists = columns.some(col => col.name === 'status'); // status 컬럼이 이미 존재하는지 확인
    //   if (!exists) {
    //     // db.execAsync 대신 트랜잭션으로 묶기
    //     await db.withTransactionAsync(async () => {
    //       await db!.runAsync(`ALTER TABLE pmmaster ADD COLUMN status TEXT DEFAULT 'pending';`);
    //       await db!.runAsync(`ALTER TABLE schedule ADD COLUMN status TEXT DEFAULT 'pending';`);
    //       await db!.runAsync(`ALTER TABLE picture ADD COLUMN status TEXT DEFAULT 'pending';`);      
    //       // 트랜잭션 내에서 PRAGMA user_version 설정
    //       await db!.runAsync(`PRAGMA user_version = 1;`); 
    //     });
    //   }      
    // }   

    // 또는 runAsync를 사용하여 개별적으로 실행할 수도 있습니다.
    // await db.runAsync("ALTER TABLE TodoItems ADD COLUMN status TEXT DEFAULT 'pending';");
    // await db.runAsync("PRAGMA user_version = 2;");
  }

  // Version 3, 4…는 if (currentVersion < 3) { ... } 형태로 순차적으로 추가합니다.

//   / --- VERSION 1: 초기 테이블 구조 변경 ---
//   if (currentVersion < 1) {
//     await db.withTransactionAsync(async () => {
//       await db!.runAsync(`ALTER TABLE pmmaster ADD COLUMN status TEXT DEFAULT 'pending';`);
//       // ... 기타 1버전 작업
//       await db!.runAsync(`PRAGMA user_version = 1;`);
//     });
//     console.log("Migration to v1 complete");
//   }

//   // --- VERSION 2: 카테고리 기능 추가 ---
//   if (currentVersion < 2) {
//     await db.withTransactionAsync(async () => {
//       await db!.runAsync(`ALTER TABLE pmmaster ADD COLUMN category TEXT;`);
//       await db!.runAsync(`PRAGMA user_version = 2;`);
//     });
//     console.log("Migration to v2 complete");
//   }

//   // --- VERSION 3: 새로운 알림 테이블 추가 ---
//   if (currentVersion < 3) {
//     await db.withTransactionAsync(async () => {
//       await db!.runAsync(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, msg TEXT);`);
//       await db!.runAsync(`PRAGMA user_version = 3;`);
//     });
//     console.log("Migration to v3 complete");
//   }
// }
}
