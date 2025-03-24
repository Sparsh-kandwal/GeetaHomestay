const CartSkeleton = () => {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        {/* Header */}
        <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-12"></div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="h-7 bg-gray-200 rounded w-40"></div>
              </div>
  
              {/* Item skeletons */}
              {[1, 2].map((item) => (
                <div key={item} className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4 aspect-video md:aspect-square rounded-lg bg-gray-200"></div>
  
                    <div className="flex-grow">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
  
                      <div className="flex justify-end mt-4">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md">
              <div className="p-6 border-b border-gray-100">
                <div className="h-7 bg-gray-200 rounded w-40"></div>
              </div>
  
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
  
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
  
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
  
                <div className="h-12 bg-gray-200 rounded-lg w-full mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default CartSkeleton;
  
  