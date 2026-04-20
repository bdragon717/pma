/**
 * Common Style Sheet
 */

import { Platform, StyleSheet } from 'react-native';

// 공유할 공통 스타일 정의
export const getCommonStyles = (colors: any,
                                fonts: any,
                                sizes: any,
                                spacings: any) => StyleSheet.create({
    container: {
      flex: 1,
    },
    containerze: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopWidth: 5,   // 글자 위에 선 긋기
      borderTopColor: colors.silverGray,
    }, 
    containerst: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }, 
    containersn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },  
    containersd: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.lotion,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.blackRd,
    },
    containerth: {
      flexDirection: 'row',
      borderTopWidth: 1,
      backgroundColor: colors.lotion, 
      borderTopColor: colors.lightGraySn,
    },
    containerfh: {
      alignItems: 'center',     // 가로 중앙!
      justifyContent: 'center', // 세로 중앙!
      backgroundColor: colors.lotion,      
    },
    containersh: {
      paddingVertical: 12,
    },
    containereh: {
      flex: 1, 
      backgroundColor: colors.white,
    },
    containeret: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blue,
    },
    containerni: {
      flex: 1, 
      backgroundColor: colors.white,
    },
    content: {
      flex: 1,
    },
    contentst: {
      flex: 1,
      paddingHorizontal: 12,
    },
    serch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 5,
      gap: 5,
    },
    serchst: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 5, 
      gap: 10,
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray, 
    },
    serchsn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 5, 
      gap: 10,
    },
    serchth: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 5, 
      gap: 5,
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    serchft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    input: {
      borderWidth: 1,
      borderRadius :5,
      paddingVertical: 4, 
      paddingHorizontal: 1,
      marginVertical: 4, 
      marginHorizontal: 1,      
      textAlignVertical: 'top',
      color: colors.black, 
      fontSize: sizes.size14, 
      borderColor: colors.green,
      backgroundColor: 'white',
    },
    contentsInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius :5,
      paddingVertical: 8, 
      paddingHorizontal: 1,
      marginVertical: 8, 
      marginHorizontal: 1,     
      textAlignVertical: 'top',
      color: colors.black, 
      fontSize: sizes.size14, 
      borderColor: colors.green,
    },
    titleInput: {
      borderWidth: 1,
      borderRadius :5,
      paddingVertical: 8, 
      paddingHorizontal: 1,
      marginVertical: 8, 
      marginHorizontal: 1,     
      textAlignVertical: 'top',
      color: colors.black, 
      fontSize: sizes.size14, 
      borderColor: colors.green,
    },    
    inputContainer: {
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,     
      paddingRight: 1, 
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    separator: {
      height: 1,
      backgroundColor: colors.gray,
    },
    separatorst: {
      color: colors.midGray,
    },
    item: {
      lineHeight: 24, // 줄간격
      paddingVertical: 4, 
      paddingHorizontal: 1,
      marginVertical: 4, 
      marginHorizontal: 1,
      fontWeight: 'normal',
    },   
    itemst: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.gray,
    }, 
    itemsn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6, 
      paddingHorizontal: 10,
      paddingRight: 10,
      marginVertical: 4, 
      backgroundColor: colors.white,
    },
    itemsd: {
      padding: 15,
      borderBottomWidth: 1,
      backgroundColor: colors.white, 
      borderBottomColor: colors.gray,
    },
    itemth: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    itemft: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10, // 화면 양 끝 여백
      backgroundColor: colors.white,
    },
    row: {
      padding: 12,
      borderBottomColor: colors.gray,
    },
    rowst: {
      alignItems: "center",
      justifyContent: 'center', 
    },
    rowsn: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center', // 세로 중앙 정렬
      alignItems: 'center',     // 가로 중앙 정렬
      backgroundColor:colors.blackTh,
    },
    modalContent: {
      //width: '80%',             // 화면 너비의 80%만 차지
      //height: '22%',            // 화면 높이의 22%만 차지
      borderRadius: 20,         // 모서리 
      padding: 20,              // 내부 여백
      // 그림자 설정 (iOS)
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      // 그림자 설정 (Android)
      elevation: 5,
      backgroundColor: colors.white, 
      shadowColor: colors.blackSn,
    },
    title: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: colors.black,
      fontSize: sizes.size18,
    },
    titlest: {
      justifyContent: 'center', // 세로 중앙 정렬
      alignItems: 'center',     // 가로 중앙 정렬
      fontSize: sizes.size18,
      fontWeight: 'normal', 
    },
    titlesn: {
      justifyContent: 'center', // 세로 중앙 정렬
      alignItems: 'center',     // 가로 중앙 정렬
      marginTop: 10,
      padding: 10, 
      backgroundColor: colors.whiteSmoke,
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    titleth: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: colors.black,
      fontSize: sizes.size18,
      paddingVertical: 15, // 글자 위아래 여백
      borderTopWidth: 2,   // 글자 위에 선 긋기
      borderTopColor: colors.silverGray, 
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
      backgroundColor: colors.white, // 배경색을 주면 더 깔끔함      
    },
    errorText: { 
      color: colors.green, 
      fontSize: sizes.size12,
      marginBottom: 10 
    },
    button: {
      flexDirection: 'row', // 아이템을 가로로 배치
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'flex-end', // 세로 방향 끝 정렬
      gap: 5, 
      paddingRight: 5,
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    buttonst: {
      flex: 1,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
      backgroundColor: colors.paleGreyBlue,
    },
    buttonsn: {
      flex: 1,
      flexDirection: 'row', // 아이템을 가로로 배치
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
    },
    buttonsd: {
      flex: 1, 
      flexDirection: 'row', // 아이템을 가로로 배치
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'flex-end', // 세로 방향 끝 정렬
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
      gap: 10,
    },
    buttonth: {      
      paddingVertical: 8, 
      paddingHorizontal: 1,
      marginVertical: 8, 
      marginHorizontal: 1,        
      alignItems: "center",
      justifyContent: 'center', 
      borderWidth: 2,
      borderRadius :5,
      backgroundColor: colors.white, 
      borderColor: colors.green,
    },
    buttonfh: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonsh: {
      flexDirection: 'row', // 아이템을 가로로 배치
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'flex-end', // 세로 방향 끝 정렬
      marginRight: 5,
      gap: 5,
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    buttonText: {
      fontWeight: 'bold',
      textAlign: 'center', 
      color: colors.black,
    },
    buttonTextDisabled: {
      color: colors.lightGrayfh,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    text: {
      fontWeight: 'bold',
      lineHeight: 24,
      color: colors.black, 
      fontSize: sizes.size16,
    },  
    textst: {
      flex: 7, // 내용이 전체를 차지하도록 함
      marginRight: 10,
    },
    textsn: {
      fontWeight: 'bold',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 50, // 줄간격
      color: colors.black, 
      fontSize: sizes.size24,
    },
    textsd: {
      fontWeight: 'bold',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 24, // 줄간격
      color:colors.gray, 
      fontSize: sizes.size16,
    },
    textth: {
      color: colors.black, 
      fontSize: sizes.size16,
      width: '100%',
    },
    textfh: {
      color: colors.black, 
      fontSize: sizes.size16,
      textAlign: 'left', // 왼쪽 정렬
      paddingHorizontal: 1,
    },
    textsh: {
      flexShrink: 1,          // 1. 공간이 부족하면 자신의 크기를 줄여서라도 영역 확보
      flexWrap: 'wrap',       // 2. 너비를 넘어가면 자동으로 줄바꿈
      width: '100%',          // 3. 부모의 가로 너비를 꽉 채우도록 기준 설정
      textAlign: 'left',
      color: colors.black, 
      fontSize: sizes.size16,
    },
    textev: {
      color: colors.black, 
      fontSize: sizes.size16, 
      minWidth: 127,
      flexShrink: 0, // 날짜 영역이 좁아지지 않게 고정
      letterSpacing: -0.5, // 자간을 살짝 좁혀 공간 확보
    },
    textet: {
      color: colors.black, 
      fontSize: sizes.size18,
      fontWeight: 'bold',
    },
    textni: {
      flex: 1,
      color: colors.black, 
      fontSize: sizes.size14, 
      fontWeight: 'bold', 
      marginRight: 10,
    },
    texttn: {
      color: colors.black, 
      fontSize: sizes.size14,
      fontWeight: 'bold',
      minWidth: 50,      // 최소 공간을 보장
      textAlign: 'right' // 글자를 오른쪽으로 밀착 
    },
    textel: {
      color: colors.black, 
      fontSize: sizes.size14, 
      minWidth: 110,
      flexShrink: 0, // 날짜 영역이 좁아지지 않게 고정
      letterSpacing: -0.5, // 자간을 살짝 좁혀 공간 확보
    },
    texttw: {
      flex: 1, // 남은 가운데 공간을 모두 차지
      color: colors.black,
      fontSize: sizes.size14,
      textAlign: 'left', // 왼쪽 정렬
      paddingHorizontal: 1,
    },
    texttt: {
      color: colors.black,
      fontSize: sizes.size14,
      width: 60, // 완료 상태 고정폭
      textAlign: 'right', // 화면 끝(오른쪽) 정렬
      flexShrink: 0,
    },
    textft: {
      color: colors.black,
      fontSize: sizes.size14,
      width: 250, // 완료 상태 고정폭
      height: 60,
      textAlign: 'left', // 화면 끝(왼쪽) 정렬
      flexShrink: 0,
      borderWidth: 1,
      borderColor: colors.green,
      borderRadius: 5,
      paddingVertical: 4,
      paddingHorizontal: 1,
      marginTop: 20,
      marginLeft: 50,
    },
    resultText: {
      marginTop: 20,
      textAlign: 'center',
      color: colors.blue, 
      fontSize: sizes.size14, 
      borderColor: colors.green,
    },
    subTitle: {
      marginTop: 100,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
    },
    subText: {
      textAlign: 'center',
      fontWeight: 'bold',
      flexWrap: 'nowrap', // 줄바꿈 방지 (일부 환경)
      textDecorationLine: 'underline', // 밑줄
      marginTop: 5,
      includeFontPadding: false, // 안드로이드 폰트 패딩으로 인한 밀림 방지
      opacity: 0.5, // 눌렀을 때 피드백
      color: colors.vividBlue, 
      fontSize: sizes.size14,
    },
    subTextst: {
      width: '100%',
      textAlign: 'center',
      fontSize: sizes.size10,
    },
    inputFocused: {
      borderWidth: 2, 
    },
    header: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      backgroundColor: colors.gray,
    },
    headerst: {
      alignItems: 'center',
    },
    headersn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: colors.gray,
    },
    headersd: {
      justifyContent: 'center',
    },
    headerth: {
      textAlign: 'center',
      margin: 10,
      color: colors.black, 
      fontSize: sizes.size18, 
      borderColor: colors.green,
    },
    headerfh: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.gray,
    },
    headerText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: sizes.size16,
    }, 
    headerTextst: {
      textAlign: 'center',
      fontSize: sizes.size18,
    },
    headerTextsn: {
      width: '100%',
      textAlign: 'center',
      fontSize: sizes.size24,
    },
    headerTitle: {
      marginTop: 100,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
    },
    combo: {
      flex: 3, // 내용이 전체를 차지하도록 함
    }, 
    combost: {
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center', // 글자 높낮이를 맞추기 위해 추가
      paddingVertical: 10,  // 상하 간격을 위해 추가
      paddingHorizontal: 15, // 좌우 여백을 줘야 'ㄱ'이 벽에 안 붙습니다.
      minHeight: 40,        // 항목당 최소 높이 보장
    },
    todoItem: {
      lineHeight: 24, // 줄간격
      paddingVertical: 4, 
      paddingHorizontal: 1,
      marginVertical: 4, 
      marginHorizontal: 1,
      fontWeight: 'normal',
      backgroundColor: colors.white,
    },
    todoItemst: {
      flexDirection: 'row', // 가로 정렬
      alignItems: 'center',
      justifyContent: 'space-between',
      lineHeight: 24, // 줄간격
      paddingVertical: 4, 
      paddingHorizontal: 1,
      marginVertical: 4, 
      marginHorizontal: 1, // 좌우 여백 추가
      fontWeight: 'normal',
      backgroundColor: colors.white,
    },
    dropdown: {
      width: '30%',             // 콤보박스 너비
      height: 39,               // 콤보박스 높이
      borderWidth: 1,           // 테두리 두께
      borderRadius: 5,          // 모서리 둥글게
      paddingHorizontal: 8,     // 내부 좌우 여백
      borderColor: colors.green, 
      backgroundColor: colors.lotion,
    },    
    dropdownst: {
      width: '100%',            // 콤보박스 너비
      height: 40,               // 콤보박스 높이
      borderWidth: 1,           // 테두리 두께
      borderRadius: 5,          // 모서리 둥글게
      paddingHorizontal: 8,     // 내부 좌우 여백
      borderColor: colors.green, 
      backgroundColor: colors.lotion,
    },
    dropdownsn: {
      width: '20%',             // 콤보박스 너비
      height: 39,               // 콤보박스 높이
      borderWidth: 1,           // 테두리 두께
      borderRadius: 5,          // 모서리 둥글게
      paddingHorizontal: 8,     // 내부 좌우 여백
      borderColor: colors.green, 
      backgroundColor: colors.lotion,
    },
    calendar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 5,
    },
    info: {
     marginBottom: 30,
    },
    infost: {
      alignItems: 'center',
      margin: 35,
    },
    infosn: {
      alignItems: 'center',
      margin: 10,
    },
    infoth: {      
     fontSize: sizes.size14,
     color: colors.darkGray,
     textAlign: 'center',
     marginTop: 50,
    },
    infoText: {
      textAlign: 'center',
      fontSize: sizes.size14,
    },
    infoTextst: {
      fontSize: sizes.size12,
    },
    authheader: {
      marginTop: 50,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
    },
    authtext: {
      width: '100%',
      textAlign: 'center',
      fontSize: sizes.size18,
    },
    pressed: {
      backgroundColor: colors.paleBlue,
    },    
    phone: {
      flexWrap: 'nowrap', // 줄바꿈 방지 (일부 환경)
      textDecorationLine: 'underline', // 밑줄
      marginTop: 4,
      includeFontPadding: false, // 안드로이드 폰트 패딩으로 인한 밀림 방지
      opacity: 0.5, // 눌렀을 때 피드백
      color: colors.vividBlue, 
      fontSize: sizes.size16,
      width: 500,
    },
    listContainer: {
      padding: 2,
    },
    imageWrapper: {
      flex: 1/3, // 한 줄에 3개 항목
      aspectRatio: 1, // 정사각형 유지
      margin: 2,
      position: 'relative',
      borderColor: colors.vividBlue,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagest: {
      width: 320,
      height: 440,
      borderRadius: 18,
    },
    selectionOverlay: {
      position: 'absolute',
      top: 5,
      right: 5,
      borderRadius: 15,
      padding: 2,
      backgroundColor: colors.white,
    },
    selectedBorder: {
      borderWidth: 4,
    },
    link: {
      fontSize: 14,
      color: colors.vividBlue,
    },
    current: {
      color: colors.blackSt,
      fontWeight: 'normal',
    },
    label: {
     fontSize: 12,
    },
    menuBox: {
      flex: 1,
      flexDirection: 'row',  
      alignItems: 'center', 
      paddingRight: 5,      
    },
    timeBox: {      
      alignItems: 'flex-end',
      paddingRight: 5,
    },
    time: {
      fontWeight: 'bold',
      fontSize: sizes.size14,
    },
    date: {
      marginTop: 2,
      color: colors.darkGray, 
      fontSize: sizes.size12,
    },
    left: {
      position: 'absolute',
      left: 12,
      height: '100%',
      justifyContent: 'center',
      zIndex: 10, // 추가: 클릭 레이어를 상단으로 올림
    },
    center: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    safe: {
      flex: 1,
      backgroundColor: colors.lotion,
    },  
    footer: {
      justifyContent: 'center',
    },
    placeholder: {
      fontSize: sizes.size14,
      color: colors.gray,
    },
    selectedText: {
      fontSize: sizes.size14, 
      color: colors.black,
    },  
    menualHeader: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.gray,
      marginTop: 20,
    },
    menualHText: {
      fontSize: sizes.size20,
    },
    menualSText: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 10,
      paddingLeft: 10,
      fontSize: sizes.size18,
    },
    menualtext: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 5,
      paddingLeft: 10,      
      fontWeight: 'normal',
      lineHeight: 24,
      color: colors.black, 
      fontSize: sizes.size14,
    },
    back: { 
      fontSize: 22, 
      marginRight: 8, 
    },
    checkbox: {
      marginRight: 5, 
    },    
    log: {
      justifyContent: 'center', 
      alignItems: 'center',
      marginTop: 50,
    },
    logheader: {
      marginTop: 50,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬
    },
    loginput: {
      marginTop: 10,
      alignItems: 'center', // 가로 방향 중앙 정렬
      justifyContent: 'center', // 세로 방향 끝 정렬      
    },
    logtext: {
      width: '100%',
      textAlign: 'center',
      fontSize: sizes.size18,
    },
    bannerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.blackNd, // 반투명 검정 배경
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    bannerBox: {
      width: '80%',
      padding: 20,
      backgroundColor: colors.white,
      borderRadius: 12, // 네모 박스 모서리
      borderWidth: 1,
      borderColor: colors.lightGraySt,
      alignItems: 'center',
      elevation: 5, // 안드로이드 그림자
      shadowColor: colors.blackSt, // iOS 그림자
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    bannerTitle: {
      fontWeight: 'bold', 
      fontSize: sizes.size16, 
      marginBottom: 10,
    },
    bannerTitlest: {
      textAlign: 'center', 
      color:  colors.darkGray,
    },
    bannerContent: {
      flexDirection: 'row', // 버튼 가로 배치
      marginTop: 20,
      gap: 10,
    },
    bannerButton: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 6,
      backgroundColor: colors.lightGrayTh,
    },
    bannerButtonst: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 6,
      backgroundColor: colors.green,
    },
    bannerTextst: {
      fontSize: sizes.size12, 
    },
    bannerTextsn: {
      fontSize: sizes.size12,
      color: colors.white,
      fontWeight: 'bold',
    },
    docItem: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    docText: {
      fontSize: sizes.size12,
    },
    docTextst: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.blackFd,
    },
    docTextsn: {
      marginTop: 10,
      color: colors.white,
    },
    docTextth: {
      lineHeight: 20,
    },
    modalContainer: { 
      width: '80%', 
      backgroundColor: colors.white, 
      borderRadius: 10, 
      padding: 20, 
      elevation: 5 
    },
    modalTitle: { 
      fontSize: sizes.size18, 
      fontWeight: 'bold', 
      marginBottom: 15, 
      textAlign: 'center',
      borderBottomWidth: 1, // 글자 아래에 선 긋기
      borderBottomColor: colors.silverGray,
    },
    modalButton: { 
      paddingVertical: 15, 
      borderBottomWidth: 0.5, 
      borderBottomColor: colors.gray, 
    },
    modalButtonText: { 
      fontSize: sizes.size16, 
      textAlign: 'center', 
    },
    cancelButton: { 
      marginTop: 10, 
      borderBottomWidth: 0, 
    },
    scrollView: { 
      maxHeight: 300,
    },
    imageView: { 
      paddingTop: Platform.OS === 'ios' ? 50 : 40, // 상태바와 겹치지 않게 충분한 여백
      paddingRight: 20, 
      alignItems: 'flex-end'
    },
    noticeView: { 
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    noticeViewst: { 
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    noticeTitle: { 
      fontSize: sizes.size18, 
      fontWeight: 'bold',
    },
    noticeText: { 
      marginTop: 10,
    },
    noticeTextst: { 
      fontWeight: 'bold',
    },
    downloadProgress: { 
      padding: 10,
    },
    downloadProgressst: { 
      height: 10,
      backgroundColor: colors.gray,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 5,
    },
    downloadProgresssn: { 
      height: '100%',
      backgroundColor: colors.green,
    },
});

// 타입 추출
export type getCommonStylesType = typeof getCommonStyles;