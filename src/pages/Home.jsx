import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, MapPin, BedDouble, Bath, Maximize, 
  Key, User, UploadCloud, Users, 
  ChevronRight, Heart, DollarSign, Loader
} from "lucide-react";
import modernInterior from "../assets/interior1.jpg";
import gharkhojLogo from "../assets/GHARKHOJ_LOGO.png";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import SmartNav from "../components/SmartNav";
import SearchSuggestions from "../components/SearchSuggestions";
import { toast } from 'sonner';

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
      toast.error(`Failed to update favorite: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(2, 132, 199, 0.25)" }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer border border-gray-100 hover:border-primary-400 transition-all duration-300"
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
      ? (data.images[0].startsWith('http')
          ? data.images[0]
          : `https://res.cloudinary.com/dvvjbzez2/image/upload/${data.images[0]}`)
      : "https://res.cloudinary.com/dvvjbzez2/image/upload/v1779440737/property_images/xzks20vrpedgsyo37thu.jpg"
  }
  alt={data.title}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src =
      "https://res.cloudinary.com/dvvjbzez2/image/upload/v1779440737/property_images/xzks20vrpedgsyo37thu.jpg";
  }}
/>

<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
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
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{data.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin size={16} className="mr-1 text-primary-600 flex-shrink-0" />
          <span className="line-clamp-1">{data.address}, {data.city}</span>
        </div>

        <div className="flex items-center justify-between mt-4 py-3 border-t border-b border-gray-100 text-gray-600 text-xs font-semibold">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><BedDouble size={16} /> {data.bedrooms}</div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Bath size={16} /> {data.bathrooms}</div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Maximize size={16} /> {data.area || 'N/A'}</div>
        </div>

        <div className="mt-4 flex justify-between items-center gap-3">
          <div>
            <span className="text-2xl font-extrabold text-primary-600">Rs. {data.rent_amount?.toLocaleString()}</span>
            <span className="text-gray-500 text-xs ml-2"> / mo</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewClick}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
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
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        
        <select 
          name="propertyType"
          value={searchParams.propertyType}
          onChange={handleInputChange}
          className="w-full md:w-48 py-3 px-4 border border-gray-200 rounded-xl text-gray-600 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">Property Type</option>
          <option value="flat">Flat / Apartment</option>
          <option value="house">Full House</option>
          <option value="room">Single Room</option>
        </select>

        <button 
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 py-3 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-primary-50 transition"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
              />
              <input 
                type="number" 
                name="maxPrice"
                value={searchParams.maxPrice}
                onChange={handleInputChange}
                placeholder="Max (Rs.)" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Bedrooms</h4>
            <select 
              name="bedrooms"
              value={searchParams.bedrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
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
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
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
                <label key={amenity} className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-primary-600">
                  <input 
                    type="checkbox"
                    checked={searchParams.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="rounded text-primary-600 focus:ring-primary-500" 
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
      boxShadow: "0 25px 50px rgba(2, 132, 199, 0.2)"
    }}
    transition={{ duration: 0.6, delay: delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-primary-600/50 flex flex-col items-center text-center hover:border-yellow-400 transition-colors"
  >
    <motion.div 
      className="p-4 bg-primary-100 rounded-full mb-4"
      whileHover={{ 
        background: "linear-gradient(135deg, #0284c7 0%, #facc15 100%)",
        scale: 1.1
      }}
      transition={{ duration: 0.3 }}
    >
      <Icon size={36} className="text-primary-600" />
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
      } catch (err) {
        console.error('Error fetching listings:', err);
        toast.error('Failed to load listings');
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
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-primary-50/50">
         {/* Background Accent Shapes */}
         <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[50rem] h-[50rem] bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
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
                 className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold mb-4"
              >
                 Your Trusted Home Search Partner
              </motion.span>
              <motion.h1 
                 variants={itemVariants}
                 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight"
              >
                Find Your Perfect <span className="text-primary-600">Ghar</span> in <br/> Kathmandu Valley.
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
                  <Link to="/search" className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-600/30">
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
                  className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary-300/50 relative z-10"
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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-dashed border-primary-200 rounded-3xl -z-10"
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
             <Link to="/search" className="hidden md:flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700 transition-all">
               View All Listings <ChevronRight size={20}/>
             </Link>
           </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader size={40} className="animate-spin text-primary-600" />
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
            className="bg-primary-600 rounded-3xl p-10 md:p-16 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center"
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
      <footer className="bg-gray-800 text-gray-300 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
           <div>
             <Link to="/">
               <img src={gharkhojLogo} alt="Gharkhoj" className="h-20 w-auto object-contain mb-4" />
             </Link>
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

// // export default Home;
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
// import {
//   Search, MapPin, BedDouble, Bath, Maximize,
//   Key, User, UploadCloud, Users,
//   ChevronRight, Heart, DollarSign, Loader,
//   Sparkles, Shield, Star, ArrowRight, Home as HomeIcon
// } from "lucide-react";
// import modernInterior from "../assets/interior1.jpg";
// import api from "../api/axios";
// import { useAuthStore } from "../stores/authStore";
// import SmartNav from "../components/SmartNav";
// import SearchSuggestions from "../components/SearchSuggestions";
// import { useToast } from "../context/ToastContext";

// const AMENITY_OPTIONS = ["Wifi", "Parking", "Balcony", "Garden", "AC"];

// /* ─────────────────────────────────────────────
//    UTILITY HOOKS
// ───────────────────────────────────────────── */
// function useMagneticHover(strength = 0.3) {
//   const ref = useRef(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);
//   const springX = useSpring(x, { stiffness: 300, damping: 30 });
//   const springY = useSpring(y, { stiffness: 300, damping: 30 });

//   const handleMouseMove = useCallback((e) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     const cx = rect.left + rect.width / 2;
//     const cy = rect.top + rect.height / 2;
//     x.set((e.clientX - cx) * strength);
//     y.set((e.clientY - cy) * strength);
//   }, [strength, x, y]);

//   const handleMouseLeave = useCallback(() => {
//     x.set(0);
//     y.set(0);
//   }, [x, y]);

//   return { ref, springX, springY, handleMouseMove, handleMouseLeave };
// }

// /* ─────────────────────────────────────────────
//    3D FLOATING ORBS BACKGROUND
// ───────────────────────────────────────────── */
// const FloatingOrb = ({ style, delay = 0, size = 400, color1, color2 }) => (
//   <motion.div
//     className="absolute rounded-full pointer-events-none"
//     style={{
//       width: size,
//       height: size,
//       background: `radial-gradient(circle at 30% 40%, ${color1}, ${color2} 70%, transparent)`,
//       filter: "blur(80px)",
//       ...style,
//     }}
//     animate={{
//       y: [0, -40, 0],
//       x: [0, 20, 0],
//       scale: [1, 1.1, 1],
//     }}
//     transition={{
//       duration: 8 + delay,
//       repeat: Infinity,
//       ease: "easeInOut",
//       delay,
//     }}
//   />
// );

// /* ─────────────────────────────────────────────
//    GLASS CARD WRAPPER
// ───────────────────────────────────────────── */
// const GlassCard = ({ children, className = "", ...props }) => (
//   <motion.div
//     className={`relative backdrop-blur-xl border border-white/20 ${className}`}
//     style={{
//       background: "rgba(255,255,255,0.07)",
//       boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
//     }}
//     {...props}
//   >
//     {children}
//   </motion.div>
// );

// /* ─────────────────────────────────────────────
//    3D TILT CARD (listing card)
// ───────────────────────────────────────────── */
// const TiltCard = ({ children, className = "" }) => {
//   const ref = useRef(null);
//   const rotateX = useMotionValue(0);
//   const rotateY = useMotionValue(0);
//   const springRX = useSpring(rotateX, { stiffness: 200, damping: 25 });
//   const springRY = useSpring(rotateY, { stiffness: 200, damping: 25 });

//   const handleMove = (e) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     const px = (e.clientX - rect.left) / rect.width;
//     const py = (e.clientY - rect.top) / rect.height;
//     rotateY.set((px - 0.5) * 18);
//     rotateX.set((0.5 - py) * 18);
//   };
//   const handleLeave = () => {
//     rotateX.set(0);
//     rotateY.set(0);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       onMouseMove={handleMove}
//       onMouseLeave={handleLeave}
//       style={{
//         rotateX: springRX,
//         rotateY: springRY,
//         transformStyle: "preserve-3d",
//         perspective: 1000,
//       }}
//       className={className}
//     >
//       {children}
//     </motion.div>
//   );
// };

// /* ─────────────────────────────────────────────
//    LISTING CARD
// ───────────────────────────────────────────── */
// const ListingCard = ({ data, onBookClick, index }) => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthStore();
//   const { addToast } = useToast();
//   const [isFavorite, setIsFavorite] = React.useState(false);
//   const [loadingFav, setLoadingFav] = React.useState(false);
//   const [imageLoaded, setImageLoaded] = React.useState(false);

//   React.useEffect(() => {
//     if (isAuthenticated) checkIfFavorited();
//   }, [data.id, isAuthenticated]);

//   const checkIfFavorited = async () => {
//     try {
//       const response = await api.get('/favorites');
//       const favoriteIds = new Set(response.data.data?.map(l => l.id) || []);
//       setIsFavorite(favoriteIds.has(data.id));
//     } catch {}
//   };

//   const handleViewClick = () => navigate(`/listing/${data.id}`, { state: { listing: data } });

//   const handleFavoriteClick = async (e) => {
//     e.stopPropagation();
//     if (!isAuthenticated) { navigate("/login", { state: { from: "home", listingId: data.id } }); return; }
//     setLoadingFav(true);
//     try {
//       if (isFavorite) {
//         await api.delete(`/favorites/${data.id}`);
//         setIsFavorite(false);
//       } else {
//         try {
//           await api.post(`/favorites/${data.id}`);
//           setIsFavorite(true);
//         } catch (postError) {
//           if (postError.response?.status === 400 && postError.response?.data?.error?.includes('already')) {
//             setIsFavorite(true);
//           } else throw postError;
//         }
//       }
//     } catch (error) {
//       addToast(`Failed to update favorite: ${error.response?.data?.error || error.message}`, 'error');
//     } finally {
//       setLoadingFav(false);
//     }
//   };

//   const imgSrc = data.images?.length > 0
//     ? (data.images[0].startsWith('http') ? data.images[0] : `http://localhost:5000${data.images[0]}`)
//     : "https://images.unsplash.com/photo-1570129477488-c70a256a7356?q=80&w=600&h=400&auto=format&fit=crop";

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
//       viewport={{ once: true }}
//     >
//       <TiltCard>
//         <div
//           className="group rounded-2xl overflow-hidden cursor-pointer"
//           style={{
//             background: "rgba(255,255,255,0.95)",
//             boxShadow: "0 4px 24px rgba(14,30,55,0.08), 0 1px 2px rgba(14,30,55,0.04)",
//             border: "1px solid rgba(255,255,255,0.8)",
//           }}
//         >
//           {/* Image */}
//           <div className="relative overflow-hidden h-56">
//             <motion.img
//               src={imgSrc}
//               alt={data.title}
//               className="w-full h-full object-cover"
//               onLoad={() => setImageLoaded(true)}
//               onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1570129477488-c70a256a7356?q=80&w=600&h=400&auto=format&fit=crop"; }}
//               whileHover={{ scale: 1.08 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               style={{ transformStyle: "preserve-3d", translateZ: 20 }}
//             />
//             {/* Gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

//             {/* Featured badge */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 }}
//               className="absolute top-4 right-4"
//             >
//               <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white"
//                 style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
//                 <Sparkles size={10} /> Featured
//               </span>
//             </motion.div>

//             {/* Favorite */}
//             <motion.button
//               whileHover={{ scale: 1.15 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleFavoriteClick}
//               disabled={loadingFav}
//               className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg"
//               style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
//             >
//               {loadingFav
//                 ? <Loader size={16} className="animate-spin text-gray-400" />
//                 : <Heart size={16} className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
//               }
//             </motion.button>
//           </div>

//           {/* Content */}
//           <div className="p-5" style={{ transform: "translateZ(10px)" }}>
//             <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-sky-600 transition-colors duration-200">
//               {data.title}
//             </h3>
//             <div className="flex items-center text-gray-400 text-sm mt-1.5 gap-1">
//               <MapPin size={13} className="text-sky-500 flex-shrink-0" />
//               <span className="line-clamp-1 text-xs">{data.address}, {data.city}</span>
//             </div>

//             {/* Stats */}
//             <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
//               {[
//                 { icon: BedDouble, value: data.bedrooms, label: "Bed" },
//                 { icon: Bath, value: data.bathrooms, label: "Bath" },
//                 { icon: Maximize, value: data.area || "—", label: "Area" },
//               ].map(({ icon: Icon, value, label }) => (
//                 <div key={label} className="flex flex-col items-center gap-0.5">
//                   <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
//                     <Icon size={13} className="text-sky-400" /> {value}
//                   </div>
//                   <span className="text-[10px] text-gray-400">{label}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4 flex justify-between items-center">
//               <div>
//                 <span className="text-xl font-extrabold text-sky-600">Rs. {data.rent_amount?.toLocaleString()}</span>
//                 <span className="text-gray-400 text-xs ml-1">/mo</span>
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.04, boxShadow: "0 8px 20px rgba(14,165,233,0.35)" }}
//                 whileTap={{ scale: 0.96 }}
//                 onClick={handleViewClick}
//                 className="px-4 py-2 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
//                 style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
//               >
//                 View <ArrowRight size={13} />
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </TiltCard>
//     </motion.div>
//   );
// };

// /* ─────────────────────────────────────────────
//    ADVANCED SEARCH
// ───────────────────────────────────────────── */
// const AdvancedSearch = ({ onSearch, loading }) => {
//   const navigate = useNavigate();
//   const [showFilters, setShowFilters] = useState(false);
//   const [searchParams, setSearchParams] = useState({
//     location: "", propertyType: "", minPrice: "", maxPrice: "",
//     bedrooms: "", bathrooms: "", amenities: []
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAmenityChange = (amenity) => {
//     setSearchParams(prev => ({
//       ...prev,
//       amenities: prev.amenities.includes(amenity)
//         ? prev.amenities.filter(a => a !== amenity)
//         : [...prev.amenities, amenity]
//     }));
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     const params = new URLSearchParams();
//     if (searchParams.location) params.append('location', searchParams.location);
//     if (searchParams.propertyType) params.append('type', searchParams.propertyType);
//     if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
//     if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
//     if (searchParams.bedrooms) params.append('bedrooms', searchParams.bedrooms);
//     if (searchParams.bathrooms) params.append('bathrooms', searchParams.bathrooms);
//     if (searchParams.amenities.length > 0) params.append('amenities', searchParams.amenities.join(','));
//     navigate(`/search?${params.toString()}`);
//   };

//   return (
//     <motion.div
//       initial={{ y: 30, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
//       className="relative z-20 max-w-5xl mx-auto"
//     >
//       <div
//         className="rounded-2xl p-6"
//         style={{
//           background: "rgba(255,255,255,0.92)",
//           backdropFilter: "blur(24px)",
//           boxShadow: "0 20px 60px rgba(14,30,55,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
//           border: "1px solid rgba(255,255,255,0.7)",
//         }}
//       >
//         <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
//           {/* Location */}
//           <div className="flex-1 relative w-full">
//             <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" size={17} />
//             <input
//               type="text"
//               name="location"
//               value={searchParams.location}
//               onChange={handleInputChange}
//               placeholder="Baneshwor, Thamel, Lalitpur..."
//               className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-100 bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-sky-400/30 focus:border-sky-300 outline-none transition-all"
//             />
//           </div>

//           {/* Type */}
//           <select
//             name="propertyType"
//             value={searchParams.propertyType}
//             onChange={handleInputChange}
//             className="w-full md:w-44 py-3 px-4 text-sm border border-gray-100 rounded-xl text-gray-600 outline-none focus:ring-2 focus:ring-sky-400/30 bg-gray-50/80 focus:bg-white transition-all"
//           >
//             <option value="">Property Type</option>
//             <option value="flat">Flat / Apartment</option>
//             <option value="house">Full House</option>
//             <option value="room">Single Room</option>
//           </select>

//           {/* Filters toggle */}
//           <motion.button
//             type="button"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center gap-2 py-3 px-4 text-sm border border-gray-100 rounded-xl text-gray-500 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 transition-all"
//           >
//             <Search size={16} /> {showFilters ? 'Less' : 'Filters'}
//           </motion.button>

//           {/* Submit */}
//           <motion.button
//             type="submit"
//             disabled={loading}
//             whileHover={{ scale: 1.03, boxShadow: "0 12px 28px rgba(250,204,21,0.45)" }}
//             whileTap={{ scale: 0.97 }}
//             className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-gray-900 transition-all"
//             style={{ background: "linear-gradient(135deg, #fde047 0%, #facc15 100%)" }}
//           >
//             {loading ? <Loader size={17} className="animate-spin" /> : <Search size={17} />}
//             {loading ? 'Searching...' : 'Find Home'}
//           </motion.button>
//         </form>

//         {/* Extended filters */}
//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.35, ease: "easeInOut" }}
//               className="overflow-hidden"
//             >
//               <div className="pt-5 mt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-5">
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Price (Rs/mo)</label>
//                   <div className="flex gap-2">
//                     <input type="number" name="minPrice" value={searchParams.minPrice} onChange={handleInputChange}
//                       placeholder="Min" className="w-full p-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400/30 outline-none" />
//                     <input type="number" name="maxPrice" value={searchParams.maxPrice} onChange={handleInputChange}
//                       placeholder="Max" className="w-full p-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400/30 outline-none" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Bedrooms</label>
//                   <select name="bedrooms" value={searchParams.bedrooms} onChange={handleInputChange}
//                     className="w-full p-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400/30 outline-none">
//                     <option value="">Any</option>
//                     {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Bathrooms</label>
//                   <select name="bathrooms" value={searchParams.bathrooms} onChange={handleInputChange}
//                     className="w-full p-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400/30 outline-none">
//                     <option value="">Any</option>
//                     {[1,2,3].map(n => <option key={n} value={n}>{n}+</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Amenities</label>
//                   <div className="grid grid-cols-2 gap-1.5">
//                     {AMENITY_OPTIONS.slice(0, 4).map(amenity => (
//                       <label key={amenity} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer hover:text-sky-600 transition-colors">
//                         <input type="checkbox" checked={searchParams.amenities.includes(amenity)}
//                           onChange={() => handleAmenityChange(amenity)}
//                           className="rounded text-sky-500 focus:ring-sky-400" />
//                         {amenity}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// };

// /* ─────────────────────────────────────────────
//    HOW IT WORKS STEP CARD
// ───────────────────────────────────────────── */
// const StepCard = ({ icon: Icon, title, description, step, delay }) => {
//   const { ref, springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHover(0.2);

//   return (
//     <motion.div
//       ref={ref}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       style={{ x: springX, y: springY }}
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
//       viewport={{ once: true }}
//     >
//       <div
//         className="relative p-8 rounded-2xl h-full group"
//         style={{
//           background: "rgba(255,255,255,0.8)",
//           backdropFilter: "blur(20px)",
//           border: "1px solid rgba(255,255,255,0.9)",
//           boxShadow: "0 4px 24px rgba(14,30,55,0.07)",
//         }}
//       >
//         {/* Step number */}
//         <div className="absolute -top-4 -right-3 text-6xl font-black select-none"
//           style={{ color: "rgba(14,165,233,0.07)", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
//           {step}
//         </div>

//         {/* Icon */}
//         <motion.div
//           className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
//           style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" }}
//           whileHover={{ scale: 1.1, rotate: 5 }}
//           transition={{ type: "spring", stiffness: 400 }}
//         >
//           <Icon size={26} className="text-sky-600" />
//           {/* glow */}
//           <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//             style={{ boxShadow: "0 0 20px rgba(14,165,233,0.3)" }} />
//         </motion.div>

//         <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
//         <p className="text-gray-500 text-sm leading-relaxed">{description}</p>

//         {/* Bottom accent line */}
//         <motion.div
//           className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full"
//           style={{ background: "linear-gradient(90deg, #0ea5e9, #38bdf8, transparent)" }}
//           initial={{ scaleX: 0 }}
//           whileInView={{ scaleX: 1 }}
//           transition={{ delay: delay + 0.4, duration: 0.8 }}
//           viewport={{ once: true }}
//         />
//       </div>
//     </motion.div>
//   );
// };

// /* ─────────────────────────────────────────────
//    STAT COUNTER
// ───────────────────────────────────────────── */
// const StatItem = ({ value, label, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.6 }}
//     viewport={{ once: true }}
//     className="text-center"
//   >
//     <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
//       {value}
//     </div>
//     <div className="text-sky-200 text-sm">{label}</div>
//   </motion.div>
// );

// /* ─────────────────────────────────────────────
//    MAIN HOME PAGE
// ───────────────────────────────────────────── */
// const Home = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthStore();
//   const { addToast } = useToast();
//   const [featuredListings, setFeaturedListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const heroRef = useRef(null);
//   const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
//   const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

//   useEffect(() => {
//     const fetchListings = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get('/listings', { params: { limit: 6, sort: 'created_at' } });
//         setFeaturedListings(response.data.data || response.data || []);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load listings');
//         setFeaturedListings([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchListings();
//   }, []);

//   const handleBookClick = (listingId) => navigate(`/listing/${listingId}`);

//   return (
//     <div className="w-full min-h-screen font-sans" style={{ background: "#f8fafc" }}>
//       {/* Import DM Serif Display */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
//         body { font-family: 'Plus Jakarta Sans', sans-serif; }
//         .serif { font-family: 'DM Serif Display', serif; }
//         @keyframes blob {
//           0%,100% { transform: translate(0,0) scale(1); }
//           33% { transform: translate(30px,-50px) scale(1.1); }
//           66% { transform: translate(-20px,20px) scale(0.9); }
//         }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>

//       <SmartNav />

//       {/* ─── HERO ─── */}
//       <section
//         ref={heroRef}
//         className="relative min-h-screen flex flex-col justify-center overflow-hidden"
//         style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #0f2746 40%, #0c2340 100%)" }}
//       >
//         {/* Orbs */}
//         <FloatingOrb style={{ top: "-10%", right: "-5%" }} size={600} color1="rgba(14,165,233,0.18)" color2="rgba(56,189,248,0.05)" delay={0} />
//         <FloatingOrb style={{ bottom: "-15%", left: "-8%" }} size={500} color1="rgba(250,204,21,0.12)" color2="rgba(234,179,8,0.04)" delay={3} />
//         <FloatingOrb style={{ top: "30%", left: "30%" }} size={300} color1="rgba(99,102,241,0.1)" color2="transparent" delay={1.5} />

//         {/* Grid overlay */}
//         <div className="absolute inset-0 opacity-[0.04]"
//           style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

//         <motion.div
//           className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
//           style={{ y: heroY, opacity: heroOpacity }}
//         >
//           {/* Left */}
//           <motion.div
//             initial={{ x: -60, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
//               style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", color: "#7dd3fc" }}
//             >
//               <Shield size={14} /> Verified Listings · Kathmandu Valley
//             </motion.div>

//             <motion.h1
//               className="serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.9 }}
//             >
//               Find Your<br />
//               Perfect{" "}
//               <span className="relative">
//                 <span style={{ color: "#fde047" }}>Ghar</span>
//                 <motion.div
//                   className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
//                   style={{ background: "linear-gradient(90deg, #fde047, #facc15)" }}
//                   initial={{ scaleX: 0 }}
//                   animate={{ scaleX: 1 }}
//                   transition={{ delay: 1, duration: 0.8 }}
//                 />
//               </span>
//             </motion.h1>

//             <motion.p
//               className="text-sky-200/80 text-lg leading-relaxed mb-8 max-w-md"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.45 }}
//             >
//               Verified flats, apartments & rooms for rent across Kathmandu, Lalitpur, and Bhaktapur — curated for modern living.
//             </motion.p>

//             <motion.div
//               className="flex flex-wrap gap-4"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//             >
//               <motion.div whileHover={{ scale: 1.04, boxShadow: "0 12px 32px rgba(250,204,21,0.4)" }} whileTap={{ scale: 0.97 }}>
//                 <Link to="/search"
//                   className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-gray-900 transition-all"
//                   style={{ background: "linear-gradient(135deg, #fde047 0%, #facc15 100%)" }}>
//                   Start Searching <ArrowRight size={18} />
//                 </Link>
//               </motion.div>
//               <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
//                 <Link to="/register?role=landlord"
//                   className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-white transition-all"
//                   style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
//                   I'm a Landlord
//                 </Link>
//               </motion.div>
//             </motion.div>

//             {/* Stats row */}
//             <motion.div
//               className="flex gap-8 mt-12 pt-8 border-t border-white/10"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.9 }}
//             >
//               {[
//                 { value: "500+", label: "Active Listings" },
//                 { value: "3 Cities", label: "Covered" },
//                 { value: "100%", label: "Verified" },
//               ].map((s, i) => (
//                 <StatItem key={s.label} {...s} delay={0.9 + i * 0.1} />
//               ))}
//             </motion.div>
//           </motion.div>

//           {/* Right — 3D floating image card */}
//           <motion.div
//             initial={{ x: 60, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
//             className="relative hidden lg:block"
//           >
//             <motion.div
//               animate={{ y: [0, -16, 0] }}
//               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//               className="relative"
//               style={{ perspective: 1200, transformStyle: "preserve-3d" }}
//             >
//               {/* Main card */}
//               <motion.div
//                 className="relative rounded-3xl overflow-hidden"
//                 style={{
//                   boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
//                   transformStyle: "preserve-3d",
//                 }}
//                 whileHover={{ rotateY: -5, rotateX: 3 }}
//                 transition={{ type: "spring", stiffness: 200 }}
//               >
//                 <img src={modernInterior} alt="Modern apartment" className="w-full h-[420px] object-cover" />
//                 {/* Shimmer overlay */}
//                 <div className="absolute inset-0"
//                   style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(14,165,233,0.05) 100%)" }} />
//                 {/* Bottom info card */}
//                 <div className="absolute bottom-0 left-0 right-0 p-5"
//                   style={{ background: "rgba(12,26,46,0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-white font-bold text-sm">Modern Flat · Baneshwor</p>
//                       <p className="text-sky-300 text-xs mt-0.5">Available Now · Verified</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-yellow-400 font-extrabold">Rs. 25,000</p>
//                       <p className="text-gray-400 text-xs">/month</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Floating mini badge — top right */}
//               <motion.div
//                 animate={{ y: [0, -8, 0] }}
//                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//                 className="absolute -top-5 -right-5 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
//                 style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", backdropFilter: "blur(10px)" }}
//               >
//                 <Star size={16} className="fill-yellow-400 text-yellow-400" />
//                 <span className="text-gray-800 font-bold text-sm">4.9 Rating</span>
//               </motion.div>

//               {/* Floating mini badge — bottom left */}
//               <motion.div
//                 animate={{ y: [0, 8, 0] }}
//                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
//                 className="absolute -bottom-5 -left-5 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
//                 style={{ background: "rgba(14,165,233,0.95)", boxShadow: "0 8px 24px rgba(14,165,233,0.35)", backdropFilter: "blur(10px)" }}
//               >
//                 <HomeIcon size={15} className="text-white" />
//                 <span className="text-white font-bold text-sm">500+ Homes</span>
//               </motion.div>
//             </motion.div>

//             {/* Decorative ring */}
//             <motion.div
//               className="absolute -inset-6 rounded-3xl border border-dashed border-sky-500/20 -z-10"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
//             />
//           </motion.div>
//         </motion.div>

//         {/* Wave bottom */}
//         <div className="absolute bottom-0 left-0 right-0 h-20">
//           <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
//             <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
//           </svg>
//         </div>
//       </section>

//       {/* ─── SEARCH BAR ─── */}
//       <div className="relative z-30 px-6 -mt-6 mb-16">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="max-w-2xl mx-auto mb-6"
//         >
//           <SearchSuggestions
//             value={searchQuery}
//             onChange={setSearchQuery}
//             onSelect={(selected) => {
//               if (typeof selected === 'string') {
//                 navigate(`/search?search=${encodeURIComponent(selected)}`);
//               } else if (selected?.id) {
//                 navigate(`/listing/${selected.id}`);
//               }
//             }}
//             placeholder="Search by location, area, or price..."
//             className="w-full"
//             disableHistory={true}
//           />
//         </motion.div>

//         <AdvancedSearch onSearch={() => {}} loading={loading} />
//       </div>

//       {/* ─── HOW IT WORKS ─── */}
//       <section className="max-w-6xl mx-auto px-6 py-20">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <motion.span
//             className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
//             style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)" }}
//           >
//             Simple Process
//           </motion.span>
//           <h2 className="serif text-4xl md:text-5xl text-gray-900 mb-4">How Gharkhoj Works</h2>
//           <p className="text-gray-500 text-lg max-w-xl mx-auto">Three easy steps to find or rent your property in the valley.</p>
//         </motion.div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <StepCard icon={Search} step="01" title="Search & Filter" delay={0}
//             description="Use detailed filters — from location to amenities — to narrow down exactly what you're looking for." />
//           <StepCard icon={Users} step="02" title="Connect & View" delay={0.15}
//             description="Contact verified landlords directly or schedule a physical visit to any listed property." />
//           <StepCard icon={Key} step="03" title="Sign & Move In" delay={0.3}
//             description="Finalize your agreement with confidence and move into your new home hassle-free." />
//         </div>
//       </section>

//       {/* ─── FEATURED LISTINGS ─── */}
//       <section className="max-w-6xl mx-auto px-6 py-12">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//           className="flex justify-between items-end mb-12"
//         >
//           <div>
//             <motion.span
//               className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
//               style={{ background: "rgba(250,204,21,0.12)", color: "#ca8a04", border: "1px solid rgba(250,204,21,0.3)" }}
//             >
//               Verified Properties
//             </motion.span>
//             <h2 className="serif text-3xl md:text-4xl text-gray-900">Featured Homes in the Valley</h2>
//             <p className="text-gray-400 mt-2 text-sm">Prime areas · Kathmandu · Lalitpur · Bhaktapur</p>
//           </div>
//           <motion.div whileHover={{ x: 4 }}>
//             <Link to="/search" className="hidden md:flex items-center gap-1.5 text-sky-600 font-semibold text-sm hover:text-sky-700 transition-colors">
//               All Listings <ChevronRight size={18} />
//             </Link>
//           </motion.div>
//         </motion.div>

//         {error && (
//           <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
//         )}

//         {loading ? (
//           <div className="flex justify-center items-center py-24">
//             <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
//               <Loader size={36} className="text-sky-500" />
//             </motion.div>
//           </div>
//         ) : featuredListings.length === 0 ? (
//           <div className="text-center py-20">
//             <HomeIcon size={48} className="text-gray-200 mx-auto mb-4" />
//             <p className="text-gray-400">No listings available at the moment.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {featuredListings.map((item, index) => (
//               <ListingCard key={item.id} data={item} onBookClick={handleBookClick} index={index} />
//             ))}
//           </div>
//         )}
//       </section>

//       {/* ─── LANDLORD CTA ─── */}
//       <section className="max-w-6xl mx-auto px-6 py-12 mb-12">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
//           viewport={{ once: true }}
//           className="relative overflow-hidden rounded-3xl"
//           style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #0f2746 60%, #0ea5e9 200%)" }}
//         >
//           {/* Orbs inside CTA */}
//           <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
//             style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)", transform: "translate(30%, -30%)" }} />
//           <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10"
//             style={{ background: "radial-gradient(circle, #fde047, transparent 70%)", transform: "translate(-30%, 30%)" }} />

//           <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8">
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center"
//                   style={{ background: "rgba(250,204,21,0.2)", border: "1px solid rgba(250,204,21,0.3)" }}>
//                   <UploadCloud size={20} className="text-yellow-400" />
//                 </div>
//                 <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">For Landlords</span>
//               </div>
//               <h2 className="serif text-3xl md:text-4xl text-white mb-3">Got a Property to Rent?</h2>
//               <p className="text-sky-200/70 max-w-lg leading-relaxed">
//                 List your flat, room, or house on Gharkhoj and find verified tenants faster than ever. Free to list, hassle-free management.
//               </p>
//             </div>
//             <motion.div whileHover={{ scale: 1.05, boxShadow: "0 16px 40px rgba(250,204,21,0.5)" }} whileTap={{ scale: 0.97 }}>
//               <Link to="/list-property"
//                 className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-gray-900 transition-all"
//                 style={{ background: "linear-gradient(135deg, #fde047 0%, #facc15 100%)" }}>
//                 List My Property <ChevronRight size={20} />
//               </Link>
//             </motion.div>
//           </div>
//         </motion.div>
//       </section>

//       {/* ─── FOOTER ─── */}
//       <footer style={{ background: "#0c1a2e" }} className="text-gray-400 py-16 mt-8">
//         <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10 mb-10">
//           <div className="col-span-2 md:col-span-1">
//             <h2 className="serif text-2xl text-white mb-3">Gharkhoj.</h2>
//             <p className="text-sm text-sky-900/80 text-gray-500">Kathmandu's #1 rental platform.</p>
//           </div>

//           {[
//             {
//               title: "For Tenants", icon: User,
//               links: [
//                 { to: "/search", label: "Search Homes" },
//                 { to: "/favorites", label: "Saved Listings", icon: Heart },
//                 { to: "/rent-guide", label: "Renter's Guide" },
//               ]
//             },
//             {
//               title: "For Landlords", icon: DollarSign,
//               links: [
//                 { to: "/list-property", label: "List Property" },
//                 { to: "/dashboard", label: "Owner Dashboard" },
//                 { to: "/pricing", label: "Pricing" },
//               ]
//             },
//             {
//               title: "Company", icon: null,
//               links: [
//                 { to: "/about", label: "About Gharkhoj" },
//                 { to: "/careers", label: "Careers" },
//                 { to: "/blog", label: "Blog" },
//               ]
//             },
//             {
//               title: "Support", icon: null,
//               links: [
//                 { to: "/help", label: "Help Center" },
//                 { to: "/contact", label: "Contact Us" },
//               ]
//             },
//           ].map(({ title, icon: Icon, links }) => (
//             <div key={title}>
//               <h3 className="text-white font-semibold mb-4 flex items-center gap-1.5 text-sm">
//                 {Icon && <Icon size={15} className="text-sky-500" />} {title}
//               </h3>
//               <ul className="space-y-2.5 text-sm">
//                 {links.map(({ to, label, icon: LIcon }) => (
//                   <li key={label}>
//                     <Link to={to} className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
//                       {LIcon && <LIcon size={13} />} {label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
//           <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved.</p>
//           <p>Built with ❤️ for Kathmandu Valley.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;