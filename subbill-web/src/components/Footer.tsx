import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SubBill</h3>
            <p className="text-gray-300">
              다양한 구독 서비스를 한눈에 비교하고 확인하세요.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">링크</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/category/ai" className="text-gray-300 hover:text-white">
                  AI
                </Link>
              </li>
              <li>
                <Link href="/category/productivity" className="text-gray-300 hover:text-white">
                  생산성
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  소개
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">연락처</h3>
            <p className="text-gray-300">
              문의사항이 있으시면 아래 이메일로 연락주세요.
            </p>
            <p className="text-gray-300 mt-2">
              contact@subbill.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} SubBill. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
