/**
 * Types Definition
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import { Dispatch, SetStateAction } from 'react';
import { ImageSourcePropType } from 'react-native';

////////////////////////////////////////////////
// 공통 Type
////////////////////////////////////////////////
export type RootStackParamList = {
  Home: undefined; // 파라미터가 없는 화면
  //Detail: { id: string }; // 'id' 파라미터를 받는 화면
  remember: undefined;
  schedule: undefined;
  secret: undefined;
};

// Button Props
export type ButtonProps = {
  label: string;
  onPress: () => void;
  isFormValid: boolean;
  icon?: string;
  widthSize: number;
  heightSize: number;
  fontSize?: number;
  
  // theme?: 'primary'; // 속성이 객체에 있을 수도 있고, 없을 수도 있다는 것을 의미 - 존재 : 'primary', 미존재 : undefined
  // select?: 'select'; // 조회
  // insert?: 'insert'; // 삽입
  // update?: 'update'; // 수정
  // delete?: 'delete'; // 삭제
  // regist?: 'regist'; // 등록
  // save?: 'save'; // 저장
  // close?: 'close'; // 닫기
};

// Image Props
export type imgProps = {
  imgSource: ImageSourcePropType;
  selectedImage?: string;
};

// ImagePickerRegist Props
export type ImagePickerRegistProp = {
  setPictureIsOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedAssets: Dispatch<SetStateAction<ImagePicker.ImagePickerAsset[]>>; 
};

// ImagePickerView Props
export type ImagePickerViewProp = {
  setPictureIsOpen: Dispatch<SetStateAction<boolean>>;
  images: PictureData[];
  pmid: string;
};

// DocumentPickerView Props
export type DocumentPickerViewProp = {
  setDocumentIsOpen: Dispatch<SetStateAction<boolean>>;
  documents: DocumentData[];
  pmid: string;
};

// CalendarView Props
export type CalendarViewProp = {
  setCalendarIsOpen: Dispatch<SetStateAction<boolean>>;
  setYear: Dispatch<SetStateAction<string>>;
  setMonth: Dispatch<SetStateAction<string>>;
  setDay: Dispatch<SetStateAction<string>>;
};

// TelNoView Props
export type TelNoViewProps = {
  setTelNoIsOpen: Dispatch<SetStateAction<boolean>>;
};

// TelNoView Data
export type ContactItemData = {
  name: string;
  phoneNumber: (string | undefined)[];
};

export type Folder = {
  id: number;
  name: string;
  parentId: number | null;
};

export type PathBarProps = {
  currentFolderId: number | null;
  folders: Folder[];
  onNavigate: (id: number | null) => void;
};

// Layout Props
export type AppLayoutProps = {
  children: React.ReactNode;
  /** 옵션 */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showPathBar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean; 
  rightSlot?: React.ReactNode;
  scroll?: boolean;
};

export type TabConfig = {
  name: string;
  title: string;
};

export type ReusableTopTabsProps = {
  tabs: TabConfig[];
};

export type ScrollContentProps = {
  children: React.ReactNode;
  padding?: number;
};

export type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
  applyInset?: boolean;
};

export type AppFooterProps = {
  applyInset?: boolean;
};

export type ScreenHeaderProps = {
  title?: string;
  showBack?: boolean;
  applyInset?: boolean;
};

export type ScreenFooterProps = {
  applyInset?: boolean;
};

export type ScreenLayoutProps = {
  children: React.ReactNode;
  /** 옵션 */  
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showPathBar?: boolean;
};

// Modal 옵션 타입
export type  ModalOption = {
  text: string;
  onPress?: () => void;
  isCancel?: boolean;
}

////////////////////////////////////////////////
// log Type
////////////////////////////////////////////////
// IdSearchView Props
export type IdSearchViewProps = {
  setIdIsOpen: Dispatch<SetStateAction<boolean>>;
};

// PwSearchView Props
export type PwSearchViewProps = {
  setPwIsOpen: Dispatch<SetStateAction<boolean>>;
};

// PasswordRegist Props
export type PasswordRegistProps = {
  isFlag?: string;
  setPwRegistIsOpen?: Dispatch<SetStateAction<boolean>>;
};

// MemberRegist Props
export type MemberRegistProps = {
  setRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

////////////////////////////////////////////////
// Remember Type
////////////////////////////////////////////////
// RememberListView Props
export type RememberListViewProp = {
  setPmid: Dispatch<SetStateAction<string>>;
  setContents: Dispatch<SetStateAction<string | null>>;
  setDetailViewIsOpen: Dispatch<SetStateAction<boolean>>;
  setRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

// RememberDetailView Props
export type RememberDetailViewProp = {
  pmid: string;
  contents: string | null;
  loadExplorer?: () => void;
  setDetailViewIsOpen?: Dispatch<SetStateAction<boolean>>;
};

// RememberRegist Props
export type RememberRegistProp = {
  folderId: number | null;
  //setRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

////////////////////////////////////////////////
// Schedule Type
////////////////////////////////////////////////
// ScheduleListView Props
export type ScheduleListViewProp = {
  setPmid: Dispatch<SetStateAction<string>>;
  setDetailViewIsOpen: Dispatch<SetStateAction<boolean>>;
  setRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

// ScheduleDetailView Props
export type ScheduleDetailViewProp = {
  pmid: string;
  //setDetailViewIsOpen: Dispatch<SetStateAction<boolean>>;
};

// ScheduleRegist Props
export type ScheduleRegistProp = {
  pmid?: string;
  registFlag?: string;
  //onSuccess?: () => void;
  //setRegistIsOpen: Dispatch<SetStateAction<boolean>>;  
};

// Schedule Form Data Props
export type ScheduleFormData = {
  contents: string | null;
};

////////////////////////////////////////////////
// Secret Type
////////////////////////////////////////////////
// SecretListView Props
export type SecretListViewProp = {
  setPmid: Dispatch<SetStateAction<string>>;
  setContents: Dispatch<SetStateAction<string | null>>;
  setDetailViewIsOpen: Dispatch<SetStateAction<boolean>>;
  setRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

// SecretDetailView Props
export type SecretDetailViewProps = {
  pmid: string;
  contents: string | null;
  loadExplorer?: () => void;
  setDetailViewIsOpen?: Dispatch<SetStateAction<boolean>>;  
};

// SecretRegist Props
export type SecretRegistProps = {
  folderId: number | null;
  setRegistIsOpen?: Dispatch<SetStateAction<boolean>>;  
};

////////////////////////////////////////////////
// Auth Type
////////////////////////////////////////////////
// 인증등록 Props
export type AuthRegistProp = {
  registFlag?: string;
  //setAuth: Dispatch<SetStateAction<boolean>>;
  //setAuthRegistIsOpen: Dispatch<SetStateAction<boolean>>;
};

// 인증확인 Props
export type AuthCheckProp = {
  setAuth: Dispatch<SetStateAction<boolean>>;
  setAuthCheckIsOpen: Dispatch<SetStateAction<boolean>>;
};

////////////////////////////////////////////////
// DB Type
////////////////////////////////////////////////
// RememberList 데이터 타입 정의
export type RememberListData = {
  pmid: string;
  kind: string | null;
  year: number;
  month: number;
  day: number;
  title: string | null;
  contents: string | null;
  folderId: number;
}

// ScheduleList 데이터 타입 정의
export type ScheduleListData = {
  pmid: string;
  kind: string | null;
  year: number;
  month: number;
  day: number;
  title: string | null;
  contents: string | null;
  folderId: number;
  complete: string | null;
  completion: string | null;
}

// SecretList 데이터 타입 정의
export type SecretListData = {
  pmid: string;
  kind: string | null;
  year: number;
  month: number;
  day: number;
  title: string | null;
  contents: string | null;
  folderId: number;
}

// Authentication Table Empty Check 데이터 타입 정의
export type AuthEmptyCheckData = {
  isEmpty: number | undefined;
}

// Authentication Check 데이터 타입 정의
export type AuthCheckData = {
  isExist: number | undefined;
}

// Pmmaster 데이터 타입 정의
export type PmmasterData = {
  pmid: string;
  kind: string | null;
  year: number;
  month: number;
  day: number;
  title: string | null;
  contents: string | null;
  folderId: number;
}

// Schedule 데이터 타입 정의
export type ScheduleData = {
  id: number;
  pmid: string;
  complete: string | null;
  contents: string | null;
}

// Secret 데이터 타입 정의
export type PictureData = {
  id: number;
  pmid: string;
  uri: string | undefined;
}

// Document 데이터 타입 정의
export type DocumentData = {
  id: number;
  pmid: string;
  name: string | undefined;
  size: number | undefined;
  uri: string | undefined;
  mimeType: string | undefined;
  createdAt: number | undefined;
  lastModified: number | undefined;
}

// Authentication 데이터 타입 정의
export type AuthData = {
  authkey: string;
  name: string | null;
  phonenumber: string | null;
  errorcount: number | null;
}

// Alarms 데이터 타입 정의
export type AlarmData = {
  id: number;
  pmid: string;
  title: string | null;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  repeat: number;
  isEnabled: number;
  notificationId: string | null;
}

// Folder 데이터 타입 정의
export type FolderData = {
  id: number;
  kind: string;
  name: string;
  parentId: number;
  sortOrder: number;
  reatedAt: string;
}

export type FolderIdRow = {
  id: number;
};

// Folder 데이터 타입 정의
export type UserData = {
  userid: string | null;
  password: string | null;
  name: string | null;
  telno: string | null;
  changepwdate: string | null;
  errorcount: number | null;
}

// AuthContextType Type
export type AuthContextType = {
  userToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// UserAuth Type
export type UserAuthType = {
  user: any | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  passwordExpired: boolean;
  hideExpireBannerToday: number | undefined | null;
  login: (user: LoginInputType) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  setPasswordExpired: (value: boolean) => void;
  postponePasswordChange: () => void;
  hideBannerToday: () => void;
}

// Notice Type
export type Notice = {
  id: string;
  content: string;
  visflag: boolean,
};

export type NoticeState = {
  visible: boolean;
  noticeId: string | null;
  notice: Notice | null;
  hiddenUntil: string | null;
  hydrated: boolean; 

  show: () => void;
  hideToday: () => Promise<void>;
  check: (notice: Notice | null) => Promise<void>;
  close: () => void;   
  setHydrated: (state: boolean) => void; 
};

// Login Type
export type LoginInputType = {
  userid: string | null;
  password: string | null;
  name: string | null;
  telno: string | null;
  changepwdate: string | null;
}

// Users Check 데이터 타입 정의
export type UserCheckData = {
  isExist: number | undefined;
}

////////////////////////////////////////////////
// DBContextType Type
////////////////////////////////////////////////
export type DBContextType = {
    dbRef: React.RefObject<SQLite.SQLiteDatabase | null>;
    rememberListSelectSql: (kind: string,
                            year?: string | null,
                            month?: string | null,
                            day?: string | null,
                            title?: string | null,
                            folderId?: number | undefined | null) => Promise<RememberListData[] | undefined>; // 반환값 타입 수정
    scheduleListSelectSql: (kind: string,
                            year?: string | null,
                            month?: string | null,
                            day?: string | null,
                            complete?: string | null) => Promise<ScheduleListData[] | undefined>; // 반환값 타입 수정         
    secretListSelectSql: (kind: string,
                          title?: string | null,
                          folderId?: number | undefined | null) => Promise<SecretListData[] | undefined>; // 반환값 타입 수정   
    authEmptyCheckSql: () => Promise<AuthEmptyCheckData | undefined>; // 반환값 타입 수정    
    authCheckSql: (authkey: string) => Promise<AuthCheckData | undefined>; // 반환값 타입 수정                             

    pmmasterSelectSql: (pmid: string,
                        kind: string | null) => Promise<PmmasterData[] | undefined>; // 반환값 타입 수정                    
    pmmasterInsertSql: (pmid: string,
                        kind: string,
                        year: string | null,
                        month: string | null,
                        day: string | null,
                        title: string | null,
                        contents: string | null,
                        folderId: number | null) => Promise<void>;
    pmmasterUpdateSql: (pmid: string,
                        title?: string | null,
                        contents?: string | null,
                        folderId?: number | undefined | null) => Promise<void>;
    pmmasterDeleteSql: (pmid: string) => Promise<void>;
    pmmasterMultiDeleteSql: (selectedIds: string[]) => Promise<void>;

    scheduleSelectSql: (pmid: string) => Promise<ScheduleData[] | undefined>; // 반환값 타입 수정
    scheduleInsertSql: (pmid: string,
                        complete: string | null,
                        contents: ScheduleFormData[]) => Promise<void>;
    scheduleUpdateSql: (id: number,
                        complete?: string | null,
                        contents?: string | null) => Promise<void>;
    scheduleDeleteSql: (id: number) => Promise<void>;
    scheduleMultiDeleteSql: (selectedIds: string[]) => Promise<void>;

    pictureSelectSql: (pmid: string) => Promise<PictureData[] | undefined>; // 반환값 타입 수정
    pictureInsertSql: (pmid: string,
                       uris: ImagePicker.ImagePickerAsset[]) => Promise<void>;
    pictureUpdateSql: (id: number,
                       uri?: string | null) => Promise<void>;
    pictureDeleteSql: (id: number[]) => Promise<void>;
    pictureSingleDeleteSql: (pmid: string) => Promise<void>;

    documentSelectSql: (pmid: string) => Promise<DocumentData[] | undefined>; // 반환값 타입 수정
    documentInsertSql: (pmid: string,
                        docs: DocumentPicker.DocumentPickerAsset[]) => Promise<void>;
    documentUpdateSql: (id: number,
                        lastModified?: string | null) => Promise<void>;
    documentDeleteSql: (id: number[]) => Promise<void>;
    documentSingleDeleteSql: (pmid: string) => Promise<void>;

    authSelectSql: (authkey?: string | null) => Promise<AuthData | undefined>; // 반환값 타입 수정
    authInsertSql: (authkey: string | null) => Promise<void>;
    authUpdateSql: (authkey?: string | null,
                    errorcount?: number | null) => Promise<void>;
    authDeleteSql: (authkey: string) => Promise<void>;

    alarmSelectSql: (id?: number | undefined,
                     isEnabled?: number | undefined,
                     notificationId?: string | null,
                     year?: string | null,
                     month?: string | null,
                     day?: string | null,
                     hour?: string | null,
                     minute?: string | null) => Promise<AlarmData[] | undefined>; // 반환값 타입 수정
    alarmInsertSql: (pmid: string,
                     title: string | null,
                     year: string | null,
                     month: string | null,
                     day: string | null,
                     hour: string | null,
                     minute: string | null,
                     repeat: number | null,
                     isEnabled: number | null,
                     notificationId: string | null) => Promise<void>;
    alarmUpdateSql: (id: number,
                    isEnabled?: number | undefined,
                    notificationId?: string | null) => Promise<void>;
    alarmDeleteSql: (id: number) => Promise<void>;
    alarmMultiDeleteSql: (selectedIds: string[]) => Promise<void>;

    folderSelectSql: (kind?: string | null,
                      id?: number | undefined | null,
                      parentId?: number | undefined | null) => Promise<FolderData[] | undefined>; // 반환값 타입 수정
    folderInsertSql: (kind: string | null,
                      name: string | null,
                      parentId: number | null,
                      sortOrder: number | null,
                      reatedAt: string | null) => Promise<void>;
    folderUpdateSql: (id: number,
                      name?: string,
                      parentId?: number | null,
                      sortOrder?: number | null,
                      reatedAt?: string) => Promise<void>;
    folderDeleteSql: (id: number) => Promise<void>;
    deleteFolderRecursiveMultiSql: (folderId: number) => Promise<void>;
    deleteFolderRecursiveNormalSql: (folderId: number) => Promise<void>;
    deletePhysicalFilesSql: (pmid: string) => Promise<void>;

    selfUserSelect: (userid: string | null,
                     name: string | null,
                     telno: string | null) => Promise<UserCheckData | undefined>; // 반환값 타입 수정
    userSelectSql: (userid?: string | null,
                    name?: string | null,
                    telno?: string | null) => Promise<UserData | undefined>; // 반환값 타입 수정
    userInsertSql: (userid: string | null,
                    password: string | null,
                    name: string | null,
                    telno: string | null,
                    changepwdate: string | null,
                    errorcount: number | null) => Promise<void>;
    userUpdateSql: (userid: string | null,
                    name: string | null,
                    telno: string | null,                    
                    password?: string | null,
                    changepwdate?: string | null,
                    errorcount?: number | null) => Promise<void>;
    userDeleteSql: (userid: string) => Promise<void>;
};
