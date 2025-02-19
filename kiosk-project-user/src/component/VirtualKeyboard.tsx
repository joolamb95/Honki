import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "simple-keyboard-layouts/build/layouts/korean";
import Hangul from "hangul-js";

interface VirtualKeyboardProps {
  onChange: (input: string) => void;
  onSend: () => void;
  onClose: () => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onChange, onSend, onClose }) => {
  const [composingText, setComposingText] = useState<string>("");
  const [finalText, setFinalText] = useState<string>("");
  const [layout, setLayout] = useState<"default" | "shift">("default");
  const [layoutMode, setLayoutMode] = useState<"korean" | "english">("korean"); // 한/영 전환
  const [isShiftActive, setIsShiftActive] = useState(false);

  useEffect(() => {
    onChange(finalText + composingText);
  }, [composingText, finalText]);

  useEffect(() => {
    // ✅ 실제 키보드 입력 감지
    const handlePhysicalKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      } else if (event.key === "Backspace") {
        setComposingText((prev) => prev.slice(0, -1));
      } else if (event.key.length === 1) {
        setComposingText((prev) => prev + event.key);
      }
    };

    window.addEventListener("keydown", handlePhysicalKeyPress);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyPress);
    };
  }, []);

  const doubleConsonants: { [key: string]: string } = {
    "ㄱ": "ㄲ",
    "ㄷ": "ㄸ",
    "ㅂ": "ㅃ",
    "ㅅ": "ㅆ",
    "ㅈ": "ㅉ"
  };

  const handleKeyPress = (input: string) => {
    let updatedText = composingText;

    if (input === "{bksp}") {
      if (composingText.length > 0) {
        updatedText = composingText.slice(0, -1);
      } else if (finalText.length > 0) {
        setFinalText(finalText.slice(0, -1));
      }
    } else if (input === "{space}") {
      setFinalText((prevFinal) => prevFinal + composingText + " ");
      updatedText = "";
    } else if (input === "{enter}") {
      handleSend();
      return;
    } else if (input === "{shift}") {
      setIsShiftActive(!isShiftActive);
      setLayout(isShiftActive ? "default" : "shift");
      return;
    } else if (input === "{lang}") {
      setLayoutMode(layoutMode === "korean" ? "english" : "korean");
      setLayout("default");
      return;
    } else {
      if (layout === "shift" && doubleConsonants[input]) {
        updatedText += doubleConsonants[input];
      } else {
        updatedText += input;
      }
      setLayout("default");
    }

    const assembled = Hangul.assemble(Hangul.disassemble(updatedText));
    setComposingText(assembled);
  };

  const handleSend = () => {
    if (finalText || composingText) {
      onSend();
      setFinalText("");
      setComposingText("");
    }
  };

  const koreanLayout = {
    default: [
      "- ! ? . * ( ) ",
      "ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ {bksp}",
      "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ {enter}",
      "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}",
      "{lang} {space}"
    ],
    shift: [
      "- ! ? . * ( ) ",
      "ㅃ ㅉ ㄸ ㄲ ㅆ ㅛ ㅕ ㅑ ㅒ ㅖ {bksp}",
      "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ {enter}",
      "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}",
      "{lang} {space}"
    ]
  };

  const englishLayout = {
    default: [
      "- ! ? . * ( ) ",
      "q w e r t y u i o p {bksp}",
      "a s d f g h j k l {enter}",
      "z x c v b n m {shift}",
      "{lang} {space}"
    ],
    shift: [
      "- ! ? . * ( ) ",
      "Q W E R T Y U I O P {bksp}",
      "A S D F G H J K L {enter}",
      "Z X C V B N M {shift}",
      "{lang} {space}"
    ]
  };

  return (
    <div className="keyboard-wrapper">
    <div className="keyboard-container">
      <Keyboard
        layoutName={layout}
        onKeyPress={handleKeyPress}
        layout={layoutMode === "korean" ? koreanLayout : englishLayout}
        display={{
          "{bksp}": "←",
          "{enter}": "⏎",
          "{shift}": "⇧",
          "{space}": "␣",
          "{lang}": "🌐" // 한/영 전환 버튼
        }}
      />
      <div className="keyboard-buttons">
        <button className="keyboard-send" onClick={handleSend}>보내기</button>
        <button className="keyboard-close" onClick={onClose}>닫기</button>
      </div>
    </div>
    </div>
  );
};

export default VirtualKeyboard;
