/**
 * Backup And Restore
 */

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getSecretKey } from "@/src/utils/keyManager";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from "expo-secure-store";
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import * as Updates from 'expo-updates'; // 앱 재시작을 위해 추가
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { unzip, zip } from 'react-native-zip-archive';

// 실제 사용 중인 DB 이름(확장자 .db 포함)
const DB_NAME = 'pmdb.db'; 
const KEY_NAME = "SQLITE_AES_KEY";

export default function BackupRestore() {
  const { styles } = useTheme();
  
  // 데이터 백업 (내보내기)
  const backupDatabase = async () => {
    try {
      const baseDir = FileSystem.documentDirectory!; // null 방지 처리
      const tmpDir = `${baseDir}backup_tmp/`;
      const zipPath = `${baseDir}full_backup.zip`;

      // 이전 잔여물 정리 및 폴더 생성
      const tmpInfo = await FileSystem.getInfoAsync(tmpDir);
      if (tmpInfo.exists) {
       await FileSystem.deleteAsync(tmpDir, { idempotent: true });
      }
      await FileSystem.makeDirectoryAsync(tmpDir, { intermediates: true });  
      
      // 암호화 키 추출 및 파일 저장
      const currentKey = await SecureStore.getItemAsync(KEY_NAME);
      if (currentKey) {
        await FileSystem.writeAsStringAsync(`${tmpDir}key.txt`, currentKey);
      } else {
        // 키가 없다면 새로 생성해서라도 저장 (첫 백업 대비)
        const newKey = await getSecretKey(); 
        await FileSystem.writeAsStringAsync(`${tmpDir}key.txt`, newKey);
      }

      // DB 파일 복사
      const dbFiles = [DB_NAME, `${DB_NAME}-wal`, `${DB_NAME}-shm`];
      for (const file of dbFiles) {
        const uri = `${baseDir}SQLite/${file}`;
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          await FileSystem.copyAsync({ 
            from: uri, 
            to: `${tmpDir}${file}` 
          });
        }
      }

      // 사진 및 문서 파일들 복사
      const allFiles = await FileSystem.readDirectoryAsync(baseDir);
      // img_ 또는 doc_로 시작하는 모든 파일 필터링
      const targetFiles = allFiles.filter(name => name.startsWith('img_') || name.startsWith('doc_'));
      
      for (const fileName of targetFiles) {
        await FileSystem.copyAsync({
          from: `${baseDir}${fileName}`,
          to: `${tmpDir}${fileName}`
        });
      }

      // 압축 (핵심!)
      // react-native-zip-archive는 경로 앞에 'file://'가 있으면 오류가 날 수 있어 제거해주는 것이 안전.
      const cleanTmpDir = tmpDir.replace('file://', '').replace(/\/$/, '');
      const cleanZipPath = zipPath.replace('file://', '');

      const zipInfo = await FileSystem.getInfoAsync(zipPath);
      if (zipInfo.exists) {
        await FileSystem.deleteAsync(zipPath, { idempotent: true });
      }

      await zip(cleanTmpDir, cleanZipPath);

      const zipFileInfo = await FileSystem.getInfoAsync(zipPath);
      if (zipFileInfo.exists) {
        const fileSize = zipFileInfo.size;
        if (fileSize > 300 * 1024 * 1024) {
          Alert.alert("용량 확인", "백업 파일이 300MB를 초과하여 카톡 전송이 어려울 수 있으니 구글 드라이브(Drive) 또는 파일에 저장을 선택해 주세요.");
        }
      } else {
        Alert.alert("백업 미존재", "백업 파일이 존재하지 않습니다.");
        return;
      }

      // 공유창 열기
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipPath, {
          dialogTitle: '전체 데이터 백업',
          mimeType: 'application/zip',        
          UTI: 'public.zip-archive' // iOS 대응을 위한 권장 설정
        });
      }

      // 마무리 정리
      await FileSystem.deleteAsync(tmpDir, { idempotent: true }); // tmpDir 삭제
    } catch (error) {
      console.error(error);
      Alert.alert("백업 실패", "백업 중 오류가 발생했습니다.");
    }
  }; 

  // 데이터 복원 (가져오기)
  const restoreDatabase = async () => { 
    Alert.alert(
      "데이터 복원",
      "기존 데이터가 모두 덮어씌워집니다. 계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'public.zip-archive'] });
            if (result.canceled) return;

            const baseDir = FileSystem.documentDirectory!;
            const unzipPath = `${baseDir}unzip_tmp/`;

            // 이전 잔여물 정리 및 압축 해제 폴더 생성
            await FileSystem.deleteAsync(unzipPath, { idempotent: true });
            await FileSystem.makeDirectoryAsync(unzipPath, { intermediates: true });

            // 압축 해제 (경로 최적화)
            const selectedFile = result.assets[0];
            const sourceUri = selectedFile.uri.replace('file://', '');
            const targetPath = unzipPath.replace('file://', '').replace(/\/$/, ''); // 마지막 슬래시 제거
            
            await unzip(sourceUri, targetPath);
            
            // 복원될 파일 목록 확인
            const restoredFiles = await FileSystem.readDirectoryAsync(unzipPath);

            // 암호화 키 복원
            if (restoredFiles.includes('key.txt')) {
              const restoredKey = await FileSystem.readAsStringAsync(`${unzipPath}key.txt`);
              await SecureStore.setItemAsync(KEY_NAME, restoredKey);
              console.log("암호화 키 복원 완료");
            }
            
            // DB 파일 복원 전 SQLite 폴더 존재 확인            
            const sqliteDir = `${baseDir}SQLite/`;
            const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
            if ( ! sqliteDirInfo.exists) {
              await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
            }

            // 파일 삭제 전, 현재 열려있을지 모르는 DB 연결을 확실히 닫기
            try {
              const db = await SQLite.openDatabaseAsync(DB_NAME);
              await db.closeAsync();
            } catch (e) {
              // 앱 설치 후 첫 실행 시 DB가 없어서 에러가 날 수 있으므로 무시
            }

            // 기존 DB 파일 및 WAL 파일 선삭제 (충돌 방지)
            await FileSystem.deleteAsync(`${sqliteDir}${DB_NAME}`, { idempotent: true });
            await FileSystem.deleteAsync(`${sqliteDir}${DB_NAME}-wal`, { idempotent: true });
            await FileSystem.deleteAsync(`${sqliteDir}${DB_NAME}-shm`, { idempotent: true }); 
            
            // DB 복원
            if ( ! restoredFiles.includes(DB_NAME)) {
              throw new Error('Invalid backup file');
            }
            const dbFilesToRestore = [DB_NAME, `${DB_NAME}-wal`, `${DB_NAME}-shm`];
            for (const file of dbFilesToRestore) {
              if (restoredFiles.includes(file)) {
                await FileSystem.copyAsync({
                  from: `${unzipPath}${file}`,
                  to: `${sqliteDir}${file}`
                });
              }
            }

            // 사진 및 문서 복원 (img_ 또는 doc_로 시작하는 파일들)
            for (const fileName of restoredFiles) {
              if (fileName.startsWith('img_') || fileName.startsWith('doc_')) {
                await FileSystem.copyAsync({
                  from: `${unzipPath}${fileName}`,
                  to: `${baseDir}${fileName}`
                });
              }
            }

            // 임시 폴더 삭제
            await FileSystem.deleteAsync(unzipPath, { idempotent: true });

            // 앱 재시작 알림
            Alert.alert(
              "복원 완료",
              "데이터가 복원되었습니다. 변경사항을 적용하기 위해 앱을 재시작합니다.",
              [{ 
                text: "확인", 
                onPress: async () => {
                  try {
                    // Expo Updates 설정이 되어 있어야 작동.
                    if (Updates.reloadAsync) {
                      await Updates.reloadAsync(); 
                    }
                  } catch (e) {
                    Alert.alert("알림", "앱을 수동으로 완전히 종료 후 다시 시작해 주세요.");
                  }
                } 
              }]
            );
          } catch (error) {
            console.error(error);
            Alert.alert("복원 실패", "올바른 백업 파일이 아니거나 복원 중 오류가 발생했습니다.");            
          }
        }}
      ]
    );    
  };

  return (
    <View style={styles.containerze}>
      <View style={styles.authheader}>
        <Text style={styles.authtext}>데이터 관리</Text>      
        <Button label="현재 데이터 백업하기" 
                onPress={backupDatabase} 
                //icon={"magnify"} 
                isFormValid={false} 
                widthSize={0.50} 
                heightSize={0.05}
                fontSize={12}/>
        <Button label="백업 파일에서 복원하기" 
                onPress={restoreDatabase} 
                //icon={"magnify"} 
                isFormValid={false} 
                widthSize={0.50} 
                heightSize={0.05}
                fontSize={12}/>
      </View>      
      <Text style={styles.infoth}>
        * 복원 후에는 반드시 앱을 재시작해야 합니다.
      </Text>
    </View>
  );
}