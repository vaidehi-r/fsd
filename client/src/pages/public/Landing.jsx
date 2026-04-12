import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiShieldCheck, HiCurrencyRupee, HiLightningBolt, HiStar, HiArrowRight } from 'react-icons/hi';
import { FaCar, FaKey, FaRoute, FaUserCheck } from 'react-icons/fa';
import api from '../../lib/axios';
import CarCard from '../../components/CarCard';

const Landing = () => {
  const [popularCars, setPopularCars] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/cars?sort=rating&limit=4');
        setPopularCars(res.data.cars);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-primary-200 text-sm font-medium rounded-full backdrop-blur-sm mb-6 animate-fade-in">
              🚗 Premium Car Rental Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-up">
              Find Your Perfect
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                Ride Today
              </span>
            </h1>
            <p className="mt-6 text-lg text-blue-100/80 max-w-xl mx-auto leading-relaxed animate-slide-up">
              Browse hundreds of quality vehicles from trusted local owners. 
              Book instantly, pay securely, and drive away with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-slide-up">
              <Link to="/cars" className="btn-primary !py-3.5 !px-8 text-base shadow-xl shadow-primary-900/30 flex items-center gap-2 group">
                Browse Cars
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/owner/apply" className="btn-secondary !bg-transparent !border-white/30 !text-white hover:!bg-white/10 !py-3.5 !px-8 text-base">
                List Your Car
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: '500+', label: 'Cars Available' },
              { value: '10K+', label: 'Happy Renters' },
              { value: '50+', label: 'Cities' },
              { value: '4.8', label: 'Avg Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/5 backdrop-blur-sm rounded-xl py-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-blue-200/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">Why Choose <span className="gradient-text">MotoLease</span>?</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Everything you need for a seamless car rental experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HiShieldCheck, title: 'Verified Owners', desc: 'Every car owner is vetted and verified for your safety.', color: 'from-green-500 to-emerald-600' },
              { icon: HiCurrencyRupee, title: 'Best Prices', desc: 'Competitive pricing with no hidden fees or charges.', color: 'from-amber-500 to-orange-600' },
              { icon: HiLightningBolt, title: 'Instant Booking', desc: 'Book your car in seconds with our streamlined process.', color: 'from-primary-500 to-primary-700' },
              { icon: HiStar, title: 'Top Rated', desc: 'Read genuine reviews from thousands of renters.', color: 'from-purple-500 to-violet-600' },
            ].map((feature) => (
              <div key={feature.title} className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">How It <span className="gradient-text">Works</span></h2>
            <p className="mt-3 text-slate-500">Rent a car in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: FaCar, title: 'Browse & Choose', desc: 'Search through our curated collection of vehicles. Filter by type, price, and location.' },
              { step: '02', icon: FaKey, title: 'Book & Pay', desc: 'Select your dates, review the price breakdown, and pay securely with Stripe.' },
              { step: '03', icon: FaRoute, title: 'Drive & Enjoy', desc: 'Pick up the car and hit the road! Leave a review when you\'re done.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-7xl font-black text-primary-100 group-hover:text-primary-200 transition-colors">
                  {item.step}
                </div>
                <div className="relative pt-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                    <item.icon className="text-primary-700 text-2xl" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars */}
      {popularCars.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Popular <span className="gradient-text">Cars</span></h2>
                <p className="mt-2 text-slate-500">Top-rated vehicles loved by our community</p>
              </div>
              <Link to="/cars" className="hidden sm:flex items-center gap-1 text-primary-700 font-semibold hover:text-primary-800 transition-colors group">
                View All <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCars.map((car) => (
                <CarCard key={car._id} car={car} showWishlist={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">What Our <span className="text-primary-400">Customers</span> Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah J.', text: 'Amazing experience! The car was in perfect condition and the owner was very helpful. Will definitely use MotoLease again.', rating: 5 },
              { name: 'Mike R.', text: 'Best car rental platform I\'ve used. The booking process was super smooth and the prices are very competitive.', rating: 5 },
              { name: 'Emily K.', text: 'As a car owner, MotoLease makes it incredibly easy to manage my listings and earn extra income. Highly recommended!', rating: 5 },
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <HiStar key={i} className="text-amber-400 text-lg" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{t.name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Hit the Road?</h2>
          <p className="text-blue-100/80 mb-8 text-lg">
            Join thousands of happy renters and car owners on MotoLease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-xl">
              Create Free Account
            </Link>
            <Link to="/cars" className="text-white border-2 border-white/30 px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Browse Cars
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
