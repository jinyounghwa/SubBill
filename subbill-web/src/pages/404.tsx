import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>페이지를 찾을 수 없습니다 | SubBill</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-blue-600">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">페이지를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-8">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            
            <div className="flex flex-col space-y-4 items-center">
              <Link href="/" className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                홈으로 돌아가기
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                이전 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
