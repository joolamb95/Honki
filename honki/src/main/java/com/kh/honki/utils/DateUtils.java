package com.kh.honki.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class DateUtils {

    /**
     * 최근 6개월의 년-월(yyyy-MM) 목록을 반환
     * @return 최근 6개월의 리스트 (예: ["2023-09", "2023-10", ..., "2024-02"])
     */
    public static List<String> getLastSixMonths() {
        List<String> months = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            months.add(now.minusMonths(i).format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }
        return months;
    }
}
