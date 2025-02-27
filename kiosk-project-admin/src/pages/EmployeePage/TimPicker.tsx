import React, { useState, useEffect, useRef } from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [ampm, setAmPm] = useState<"AM" | "PM">("AM");
  const [hour, setHour] = useState<string>("09");
  const [minute, setMinute] = useState<string>("00");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1) 부모에서 내려준 value가 바뀌면, 내부 state를 업데이트
  useEffect(() => {
    if (value && value.trim() !== "") {
      const [time, period] = value.split(" ");
      const [h, m] = time.split(":");
  
      // 🔹 현재 값과 다를 때만 상태 변경
      if (h !== hour || m !== minute || period !== ampm) {
        setHour(h);
        setMinute(m);
        setAmPm(period as "AM" | "PM");
      }
    }
  }, [value, hour, minute, ampm]); // 현재 상태를 의존성 배열에 추가
  

  // 2) 드롭다운 열기/닫기
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 3) AM/PM 선택 시
  const handleAmPmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmPm = e.target.value as "AM" | "PM";
    setAmPm(newAmPm);
    const newTime = `${hour}:${minute} ${newAmPm}`;
    // **사용자 액션 시점에 바로 onChange 호출**
    if (newTime !== value) {
      onChange(newTime);
    }
  };

  // 4) 시(hour) 선택 시
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    if (newHour !== hour) { // 🔥 값이 변경될 때만 실행
      setHour(newHour);
      const newTime = `${newHour}:${minute} ${ampm}`;
      if (newTime !== value) {
        onChange(newTime);
      }
    }
  };
  

  // 5) 분(minute) 선택 시
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    const newTime = `${hour}:${newMinute} ${ampm}`;
    if (newTime !== value) {
      onChange(newTime);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: "150px",
        marginRight: "40px",
        cursor: "pointer",
        textAlign: "right",
      }}
    >
      {/* 클릭 시 드롭다운 열기 */}
      <div
        onClick={toggleDropdown}
        style={{
          padding: "6px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fff",
          textAlign: "center",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "110px",
        }}
      >
        {hour}:{minute} {ampm}
        <span style={{ marginLeft: "5px" }}>▼</span>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "48px",
            left: "0",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            zIndex: 1050,
            boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
            minWidth: "150px",
          }}
        >
          {/* AM / PM */}
          <select
            value={ampm}
            onChange={handleAmPmChange}
            style={{ padding: "10px", width: "100%", textAlign: "center", borderRadius: "4px" }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>

          {/* 시(hour) 1~12 */}
          <select
            value={hour}
            onChange={handleHourChange}
            style={{ padding: "10px", width: "100%", textAlign: "center", borderRadius: "4px" }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const hourValue = (i + 1).toString().padStart(2, "0");
              return (
                <option key={hourValue} value={hourValue}>
                  {hourValue}
                </option>
              );
            })}
          </select>

          {/* 분(minute) 0~59 */}
          <select
            value={minute}
            onChange={handleMinuteChange}
            style={{ padding: "10px", width: "100%", textAlign: "center", borderRadius: "4px" }}
          >
            {Array.from({ length: 60 }, (_, i) => {
              const minValue = i.toString().padStart(2, "0");
              return (
                <option key={minValue} value={minValue}>
                  {minValue}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
