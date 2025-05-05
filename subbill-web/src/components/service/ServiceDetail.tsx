import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ServiceDetail() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">서비스 준비 중</h1>
      <p className="text-gray-600 mb-8">요청하신 서비스 페이지는 현재 준비 중입니다.</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors">
        메인으로 돌아가기
      </Link>
    </div>
  );
}
