import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, MapPin, BedDouble, Bath, Maximize, 
  Key, User, UploadCloud, Users, 
  ChevronRight, Heart, DollarSign, Loader
} from "lucide-react";
import modernInterior from "../assets/interior1.jpg";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import SmartNav from "../components/SmartNav";
import SearchSuggestions from "../components/SearchSuggestions";

const AMENITY_OPTIONS = ["Wifi", "Parking", "Balcony", "Garden", "AC"];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const rotateVariants = {
  animate: {
    rotateY: [0, 360],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const scaleVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

const glowVariants = {
  initial: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
  hover: { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
};

// --- COMPONENTS ---

const ListingCard = ({ data, onBookClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [loadingFav, setLoadingFav] = React.useState(false);

  // Check if this listing is favorited when component mounts
  React.useEffect(() => {
    if (isAuthenticated) {
      checkIfFavorited()
    }
  }, [data.id, isAuthenticated])

  const checkIfFavorited = async () => {
    try {
      const response = await api.get('/favorites')
      // Response returns full listing objects, so map the id field
      const favoriteIds = new Set(response.data.data?.map(listing => listing.id) || [])
      setIsFavorite(favoriteIds.has(data.id))
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
  }
  
  const handleViewClick = () => {
    navigate(`/listing/${data.id}`, { state: { listing: data } });
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "home", listingId: data.id } });
    } else {
      onBookClick(data.id);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "home", listingId: data.id } });
      return;
    }

    setLoadingFav(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await api.delete(`/favorites/${data.id}`);
        setIsFavorite(false);
      } else {
        // Add to favorites - use correct endpoint with id in URL
        try {
          await api.post(`/favorites/${data.id}`);
          setIsFavorite(true);
        } catch (postError) {
          // If already in favorites error, treat as already favorited
          if (postError.response?.status === 400 && postError.response?.data?.error?.includes('already')) {
            setIsFavorite(true);
          } else {
            throw postError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite - Full Error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      console.error('Error data:', error.response?.data)
      alert(`Failed to update favorite: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.25)" }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer border border-gray-100 hover:border-blue-400 transition-all duration-300"
      style={{ perspective: 1000 }}
    >
      <motion.div 
        className="relative overflow-hidden h-56"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={
            data.images && data.images.length > 0 
              ? (data.images[0].startsWith('http') ? data.images[0] : `http://localhost:5000${data.images[0]}`)
              : "https://images.unsplash.com/photo-1570129477488-c70a256a7356?q=80&w=600&h=400&auto=format&fit=crop"
          }
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1570129477488-c70a256a7356?q=80&w=600&h=400&auto=format&fit=crop" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Featured
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-lg z-10"
        >
          {loadingFav ? (
            <Loader size={18} className="animate-spin text-gray-400" />
          ) : (
            <Heart
              size={18}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          )}
        </motion.button>
      </motion.div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{data.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin size={16} className="mr-1 text-blue-600 flex-shrink-0" />
          <span className="line-clamp-1">{data.address}, {data.city}</span>
        </div>

        <div className="flex items-center justify-between mt-4 py-3 border-t border-b border-gray-100 text-gray-600 text-xs font-semibold">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><BedDouble size={16} /> {data.bedrooms}</div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Bath size={16} /> {data.bathrooms}</div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Maximize size={16} /> {data.area || 'N/A'}</div>
        </div>

        <div className="mt-4 flex justify-between items-center gap-3">
          <div>
            <span className="text-2xl font-extrabold text-blue-600">Rs. {data.rent_amount?.toLocaleString()}</span>
            <span className="text-gray-500 text-xs ml-2"> / mo</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
          >
            View
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};


const AdvancedSearch = ({ onSearch, loading }) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    amenities: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setSearchParams(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.propertyType) params.append('type', searchParams.propertyType);
    if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
    if (searchParams.bedrooms) params.append('bedrooms', searchParams.bedrooms);
    if (searchParams.bathrooms) params.append('bathrooms', searchParams.bathrooms);
    if (searchParams.amenities.length > 0) params.append('amenities', searchParams.amenities.join(','));
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="bg-white p-6 rounded-2xl shadow-2xl -mt-10 relative z-20 max-w-6xl mx-auto border border-gray-100"
    >
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-grow relative w-full md:w-auto">
          <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20}/>
          <input
            type="text"
            name="location"
            value={searchParams.location}
            onChange={handleInputChange}
            placeholder="Search Area (e.g., Baneshwor, Thamel...)"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        
        <select 
          name="propertyType"
          value={searchParams.propertyType}
          onChange={handleInputChange}
          className="w-full md:w-48 py-3 px-4 border border-gray-200 rounded-xl text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Property Type</option>
          <option value="flat">Flat / Apartment</option>
          <option value="house">Full House</option>
          <option value="room">Single Room</option>
        </select>

        <button 
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 py-3 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-blue-50 transition"
        >
          <Search size={18}/> {showFilters ? 'Hide Filters' : 'More Filters'}
        </button>

        <button 
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-bold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? <Loader size={20} className="animate-spin" /> : <Search size={20} />} 
          {loading ? 'Searching...' : 'Find Home'}
        </button>
      </form>

      <motion.div 
        initial={false}
        animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-6 border-t border-gray-100 mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Price (Monthly)</h4>
            <div className="flex gap-2 items-center">
              <input 
                type="number" 
                name="minPrice"
                value={searchParams.minPrice}
                onChange={handleInputChange}
                placeholder="Min (Rs.)" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <input 
                type="number" 
                name="maxPrice"
                value={searchParams.maxPrice}
                onChange={handleInputChange}
                placeholder="Max (Rs.)" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Bedrooms</h4>
            <select 
              name="bedrooms"
              value={searchParams.bedrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Bathrooms</h4>
            <select 
              name="bathrooms"
              value={searchParams.bathrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Key Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.slice(0, 4).map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-blue-600">
                  <input 
                    type="checkbox"
                    checked={searchParams.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="rounded text-blue-600 focus:ring-blue-500" 
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


const StepCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ 
      scale: 1.05, 
      y: -12,
      boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)"
    }}
    transition={{ duration: 0.6, delay: delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-600/50 flex flex-col items-center text-center hover:border-yellow-400 transition-colors"
  >
    <motion.div 
      className="p-4 bg-blue-100 rounded-full mb-4"
      whileHover={{ 
        background: "linear-gradient(135deg, #3b82f6 0%, #facc15 100%)",
        scale: 1.1
      }}
      transition={{ duration: 0.3 }}
    >
      <Icon size={36} className="text-blue-600" />
    </motion.div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);


// --- MAIN HOME PAGE ---

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured listings from database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/listings', {
          params: {
            limit: 6,
            sort: 'created_at'
          }
        });
        setFeaturedListings(response.data.data || response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings');
        setFeaturedListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleBookClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleSearch = (searchParams) => {
    // Navigation is handled in AdvancedSearch component
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      {/* 1. Smart Navbar Integration */}
      <SmartNav />

      {/* Modern Split Hero Section (Focused on Kathmandu Valley) */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-blue-50/50">
         {/* Background Accent Shapes */}
         <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[50rem] h-[50rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
         <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[50rem] h-[50rem] bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               variants={containerVariants}
               viewport={{ once: true }}
            >
              <motion.span 
                 variants={itemVariants}
                 className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4"
              >
                 Your Trusted Home Search Partner
              </motion.span>
              <motion.h1 
                 variants={itemVariants}
                 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight"
              >
                Find Your Perfect <span className="text-blue-600">Ghar</span> in <br/> Kathmandu Valley.
              </motion.h1>
              <motion.p 
                 variants={itemVariants}
                 className="text-xl text-gray-600 mt-6 leading-relaxed max-w-lg"
              >
                Verified listings of Flats, Apartments, and Rooms for Rent across Kathmandu, Lalitpur, and Bhaktapur.
              </motion.p>
              <motion.div 
                 variants={itemVariants}
                 className="mt-8 flex gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/search" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
                    Start Your Search
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register?role=landlord" className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-yellow-400 hover:text-gray-900 transition">
                    I am a Landlord
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="relative"
            >
               <motion.div 
                  animate={floatingVariants}
                  className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-300/50 relative z-10"
               >
                <img 
                  src={modernInterior} 
                  alt="Modern Apartment in Kathmandu" 
                  className="w-full h-full object-cover"
                />
               </motion.div>
               
               {/* Background accent shape with rotation */}
               <motion.div 
                  animate={rotateVariants}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-dashed border-blue-200 rounded-3xl -z-10"
               ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* YouTube-Style Search Bar */}
      <div className="px-6 -mt-8 relative z-30 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <SearchSuggestions
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(selected) => {
              if (typeof selected === 'string') {
                // Search text entered
                console.log('[Home] Search text:', selected)
                navigate(`/search?search=${encodeURIComponent(selected)}`)
              } else if (selected?.id) {
                // Property selected from dropdown
                console.log('[Home] Property selected:', selected)
                navigate(`/listing/${selected.id}`)
              }
            }}
            placeholder="Search by location, area, or price..."
            className="w-full"
            disableHistory={true}
          />
        </motion.div>
      </div>

      {/* Advanced Search Section (Overlapping Hero) */}
      <div className="px-6 mt-8">
        <AdvancedSearch onSearch={handleSearch} loading={loading} />
      </div>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto mt-24 px-6">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
           <h2 className="text-4xl font-extrabold text-gray-900">How Gharkhoj Works</h2>
           <p className="text-xl text-gray-600 mt-3">Simple steps to finding or renting your property.</p>
        </motion.div>

        <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants}>
            <StepCard 
              icon={Search} 
              title="1. Search & Filter" 
              description="Use our detailed filters (from location to amenities) to find exactly what you need." 
              delay={0}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StepCard 
              icon={Users} 
              title="2. Connect & View" 
              description="Directly contact the verified landlord or schedule a physical visit to the property." 
              delay={0.2}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StepCard 
              icon={Key} 
              title="3. Sign & Move In" 
              description="Finalize the agreement with confidence and move into your new home in Kathmandu." 
              delay={0.4}
            />
          </motion.div>
        </motion.div>
      </section>


      {/* Featured Listings Section - DYNAMIC */}
      <section className="max-w-7xl mx-auto mt-24 px-6">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           viewport={{ once: true }}
           className="flex justify-between items-end mb-12"
        >
           <div>
             <h2 className="text-3xl font-bold text-gray-900">Featured Homes in the Valley</h2>
             <p className="text-gray-600 mt-2">Verified properties in prime areas of Kathmandu, Lalitpur, and Bhaktapur.</p>
           </div>
           <motion.div whileHover={{ gap: "12px" }}>
             <Link to="/search" className="hidden md:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 transition-all">
               View All Listings <ChevronRight size={20}/>
             </Link>
           </motion.div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No listings available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((item, index) => (
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  key={item.id}
               >
                <ListingCard data={item} onBookClick={handleBookClick} />
               </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Landlord Call to Action (Fixed Link) */}
      <section className="max-w-7xl mx-auto mt-32 px-6">
         <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-3xl p-10 md:p-16 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center"
         >
           <div>
             <div className="flex items-center gap-3 mb-2">
                <UploadCloud size={30} className="text-yellow-400"/>
                <h2 className="text-3xl font-extrabold">Got a Property to Rent?</h2>
             </div>
             <p className="text-lg opacity-90 max-w-lg mt-2">
               List your flat, room, or house on Gharkhoj and find verified tenants faster than ever. Free to list, hassle-free management.
             </p>
           </div>
           <motion.div
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.98 }}
           >
             <Link 
               to="/list-property"
               className="mt-6 md:mt-0 px-8 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg hover:shadow-yellow-400/50 flex items-center gap-2"
               style={{
                 boxShadow: "0 0 20px rgba(250, 204, 21, 0.4)"
               }}
             >
               List My Property Now <ChevronRight size={20}/>
             </Link>
           </motion.div>
         </motion.div>
      </section>


      {/* Modern Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
           <div>
             <h2 className="text-white text-2xl font-bold mb-4">Gharkhoj.</h2>
             <p className="text-sm">Kathmandu's #1 rental platform.</p>
           </div>
           
           {/* Tenant Menu */}
           <div>
             <h3 className="text-white font-semibold mb-4 flex items-center gap-1"><User size={18}/> For Tenants</h3>
             <ul className="space-y-2 text-sm">
               <li><Link to="/search" className="hover:text-white transition">Search Homes</Link></li>
               <li><Link to="/favorites" className="hover:text-white transition flex items-center gap-1"><Heart size={16}/> Saved Listings</Link></li>
               <li><Link to="/rent-guide" className="hover:text-white transition">Renter's Guide</Link></li>
             </ul>
           </div>
           
           {/* Landlord Menu */}
           <div>
             <h3 className="text-white font-semibold mb-4 flex items-center gap-1"><DollarSign size={18}/> For Landlords</h3>
             <ul className="space-y-2 text-sm">
               <li><Link to="/list-property" className="hover:text-white transition">List Property</Link></li>
               <li><Link to="/dashboard" className="hover:text-white transition">Owner Dashboard</Link></li>
               <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
             </ul>
           </div>
           
           {/* Company/About Menu */}
           <div>
             <h3 className="text-white font-semibold mb-4">Company</h3>
             <ul className="space-y-2 text-sm">
               <li><Link to="/about" className="hover:text-white transition">About Gharkhoj</Link></li>
               <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
               <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
             </ul>
           </div>
           
           {/* Support Menu */}
           <div>
             <h3 className="text-white font-semibold mb-4">Support</h3>
             <ul className="space-y-2 text-sm">
               <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
               <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
             </ul>
           </div>
        </div>
        <div className="text-center border-t border-gray-800 pt-8">
          <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;