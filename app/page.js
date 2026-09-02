
import { LogIn, Rabbit, Shield, TrendingDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/superbase/server";
import { getPorducts } from "@/app/auth/callback/actions";
import Image from "next/image";
import AddProForm from "@/components/AddProForm";
import AuthBtn from "@/components/AuthBtn";
import ProductCard from "@/components/ProductCard";
export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getPorducts() : [];


  const Features = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Experience blazing fast performance with our optimized platform.",
    },
    {
      icon: Shield,
      title: "Secure",
      description:
        "Your data is safe with our top-notch security measures.",
    },
    {
      icon: Users,
      title: "Collaborative",
      description:
        "Work together seamlessly with our collaborative tools.",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={500}
              height={500}
              className="h-10 w-auto"
            />
          </div>

          {/* Auth Button */}
          <AuthBtn user={user}/>
         
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-sm font-medium mb-6">
            <span>Made with Demons</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Never Miss Price Drop Deals
          </h2>

          {/* Description */}
          <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
            Get notified instantly when prices drop on your favorite products.
            Save money and time with our smart alerts.
          </p>

          {/* Add Products Form */}
          <AddProForm user={user} /> 

          {/* Features */}
          {products.length === 0 && (
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              
              {Features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  
                  {/* Feature Icon */}
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>

                  {/* Feature Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">
                    {title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-gray-700 text-sm text-center">
                    {description}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>
      </section>

      <section>
        {user && products.length > 0 && (
          <section className="max-w-8xl mx-auto px-4 pb-20 text-center">
            <div className="flex items-center justify-center mb-6">
            <div className="mb-6">
  <h2 className="text-2xl font-bold text-gray-900">
    Your Tracked Products
  </h2>

  <p className="text-sm text-gray-500 mt-1">
    Products you are currently tracking
  </p>
</div>

              <span className="text-sm text-gray-500">
                {products.length} product{products.length === 1 ? "product" : "products"} being tracked
              </span>

              <div className="grid gap-6 md:grid-cols-2">
              {products.map((product) => (
               <ProductCard key={product.id} product={product}  user={user} />
                ))}
             </div>
              
              
            </div>
          </section>
        )}
      </section>

      {user && products.length === 0 && (
  <section className="max-w-2xl mx-auto px-4 pb-20">
    <div className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-10 text-center shadow-sm">
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <TrendingDown className="w-8 h-8 text-orange-500" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No products yet
      </h3>

      <p className="text-gray-600">
        Add your first product above to start tracking price drops.
      </p>
    </div>
  </section>
)} 


    </main>
  );
}