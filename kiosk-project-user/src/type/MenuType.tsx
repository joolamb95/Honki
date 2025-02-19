export type Menu = {
  menuNo: number; // 메뉴 번호 (PK)
  menuName: string; // 메뉴 한글명
  engName: string; // 메뉴 영어명
  menuPrice: number; // 가격
  menuImg: string; // 이미지 URL
  menuStatus: string; // 판매 상태 (판매중, 품절 등)
  categoryNo: number; // 카테고리 번호 (FK)
  categoryName?: string; // ✅ categoryName 직접 포함
};
