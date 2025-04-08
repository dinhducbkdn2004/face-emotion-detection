import type { Route } from "./+types/home";
import HomePage from "../pages/HomePage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Face Emotion Detection" },
    { name: "description", content: "Ứng dụng phát hiện cảm xúc khuôn mặt" },
  ];
}

export default function Home() {
  return (
    <HomePage />
  );
} 