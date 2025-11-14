import { Suspense } from 'react';
import ContentPage from "../components/ContentPage";

export default function Content() {
  return (
    <Suspense fallback={null}>
      <ContentPage />
    </Suspense>
  );
}
