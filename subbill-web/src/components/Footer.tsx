export default function Footer() {
  return (
    <footer className="bg-gray-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div>
          <h3 className="text-xl font-bold mb-2">SubBill</h3>
          <p className="text-gray-300 mb-6">
            다양한 구독 서비스를 한눈에 비교하고 확인하세요.
          </p>
        </div>
        
        <div className="border-t border-gray-600 mt-4 pt-4 text-gray-300">
          <p>&copy; {new Date().getFullYear()} SubBill. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
