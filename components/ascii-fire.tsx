import React, { useEffect, useRef } from "react";

const AsciiFireAnimation = () => {
  const preRef = useRef(null);

  useEffect(() => {
    const width = 135;
    const height = 25;
    const size = width * height;
    const b: any = [];
    for (let i = 0; i < size + width + 1; i++) b[i] = 0;
    const char = " commend".split("");

    function f() {
      for (let i = 0; i < 10; i++)
        b[Math.floor(Math.random() * width) + width * (height - 1)] = 70;
      let a = "";
      for (let i = 0; i < size; i++) {
        b[i] = Math.floor(
          (b[i] + b[i + 1] + b[i + width] + b[i + width + 1]) / 4
        );
        a += char[b[i] > 7 ? 7 : b[i]];
        if (i % width > width - 2) a += "\r\n";
      }

      if (preRef.current) {
        // @ts-ignore
        preRef.current.firstChild.data = a;
      }
      setTimeout(f, 30);
    }
    f();
  }, []);

  return (
    <pre ref={preRef} className="font-bold text-white mx-auto">
      This animated fire in plain ASCII art needs JavaScript to run in your web
      browser.
    </pre>
  );
};

export default AsciiFireAnimation;
