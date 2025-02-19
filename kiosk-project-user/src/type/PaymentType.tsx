export interface paymentType {
    orderId: string;
    paymentType: "카드" | "토스페이" | "간편결제" | "카카오페이"; // 결제 유형
    totalPrice: number;
    status: "성공" | "실패"; // 결제 상태
    createdAt: string; // 결제 요청 시간
}
