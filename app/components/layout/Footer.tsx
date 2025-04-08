import React from "react";

export default function Footer() {
  return (
    <footer className="py-6 bg-gray-100">
      <div className="container px-4 mx-auto">
        <div className="text-center text-gray-500">
          <p>© {new Date().getFullYear()} Face Emotion Detection. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
} 