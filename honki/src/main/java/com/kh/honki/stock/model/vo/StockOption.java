package com.kh.honki.stock.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StockOption {
    private int optionNo;                    // OPTION_NO (PK, FK)
    private String optionName;                // OPTION_NAME
    private int stockOptionQuantity;         // STOCK_OPTION_QUANTITY
    private String stockOptionStatus;        // STOCK_OPTION_STATUS
    private String stockOptionLastUpdate;    // STOCK_OPTION_LAST_UPDATE
}
