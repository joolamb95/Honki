export type CategoryType ={
    categoryNo : number;
    categoryName: string;
  }
  
  export const categories: CategoryType[] = [
    { categoryNo: 1, categoryName: "인기 메뉴" },
    { categoryNo: 2, categoryName: "추천 메뉴" },
    { categoryNo: 3, categoryName: "안주류" },
    { categoryNo: 4, categoryName: "탕류" },
    { categoryNo: 5, categoryName: "볶음류" },
    { categoryNo: 6, categoryName: "튀김류" },
    { categoryNo: 7, categoryName: "사이드" },
    { categoryNo: 8, categoryName: "음료주류" },
  ];

  export const getCategoryName = (categoryNo : number): string =>{
    const category = categories.find((cat)=> cat.categoryNo === categoryNo);
    return category ? category.categoryName : " 알수 없음";

  }