package com.kh.honki.chat.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bell {

	private int bellNo;
	private String bellMessage;
	private int tableNo;
	private int roomNo;
	private String bellDate;
}
