import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaTimes, FaTrashAlt, FaCheck } from 'react-icons/fa';

const Movie = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlistSearchTerm, setWatchlistSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['all', 'action', 'comedy', 'drama', 'horror', 'romance'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_API_KEY}`);
        const data = await response.json();
        const moviesData = data.results.map(movie => ({
          id: movie.id,
          title: movie.title,
          description: movie.overview,
          category: movie.genre_ids.length > 0 ? movie.genre_ids[0] : 'unknown',
          image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          releaseDate: movie.release_date,
          rating: movie.vote_average,
        }));
        setTimeout(() => {
          setMovies(moviesData);
          setFilteredMovies(moviesData);
          setIsLoading(false);
        }, 3000);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = movies.filter(movie =>
      (category === 'all' || movie.category === category) &&
      (movie.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        movie.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredMovies(filtered);
  }, [category, searchTerm, movies]);

  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  };

  const Spinner = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const addToWatchlist = (movie) => {
    if (!watchlist.some(watchlistMovie => watchlistMovie.id === movie.id)) {
      setWatchlist((prevWatchlist) => [...prevWatchlist, movie]);
    }
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist((prevWatchlist) => prevWatchlist.filter(movie => movie.id !== movieId));
    closeModal(); // Menutup modal setelah menghapus dari watchlist
  };

  const filteredWatchlist = watchlist.filter(movie =>
    movie.title.toLowerCase().includes(watchlistSearchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(watchlistSearchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Movie Pedia</h1>

      <div className="flex justify-center mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 mx-1 rounded ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <FaSearch className="absolute top-3 right-3 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="border p-4 rounded shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer" onClick={() => openModal(movie)}>
              <img src={movie.image} alt={movie.title} className="w-full h-64 object-cover mb-4 rounded" />
              <h2 className="text-lg font-semibold mb-2">{movie.title}</h2>
              <p className="text-gray-700 mb-2 text-sm">{truncateDescription(movie.description, 150)}</p>
              <p className="text-gray-500 mb-2 text-xs">Release Date: {movie.releaseDate}</p>
              <div className="flex items-center mb-2">
                <span className="text-gray-900 mr-1">Rating:</span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="text-gray-900">{movie.rating}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  className={`px-2 py-1 rounded flex items-center text-xs ${watchlist.some(watchlistMovie => watchlistMovie.id === movie.id) ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-green-500 text-white cursor-pointer'}`}
                  onClick={(e) => { e.stopPropagation(); addToWatchlist(movie); }}
                  disabled={watchlist.some(watchlistMovie => watchlistMovie.id === movie.id)}
                >
                  {watchlist.some(watchlistMovie => watchlistMovie.id === movie.id) ? <FaCheck className="mr-1" /> : <FaStar className="mr-1" />} {watchlist.some(watchlistMovie => watchlistMovie.id === movie.id) ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredMovies.length === 0 && !isLoading && <p className="text-center">No movies found.</p>}

      {watchlist.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Watchlist</h2>
          <div className="flex justify-center mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search Watchlist..."
                value={watchlistSearchTerm}
                onChange={e => setWatchlistSearchTerm(e.target.value)}
                className="p-2 border rounded w-full"
              />
              <FaSearch className="absolute top-3 right-3 text-gray-400" />
            </div>
          </div>
          {filteredWatchlist.length === 0 ? (
            <p className="text-center">No movies in watchlist found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredWatchlist.map((movie) => (
                <div key={movie.id} className="border p-4 rounded shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer" onClick={() => openModal(movie)}>
                  <img src={movie.image} alt={movie.title} className="w-full h-64 object-cover mb-4 rounded" />
                  <h2 className="text-lg font-semibold mb-2">{movie.title}</h2>
                  <p className="text-gray-700 mb-2 text-sm">{truncateDescription(movie.description, 150)}</p>
                  <p className="text-gray-500 mb-2 text-xs">Release Date: {movie.releaseDate}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-gray-900 mr-1">Rating:</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="text-gray-900">{movie.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      className="px-2 py-1 rounded flex items-center text-xs bg-red-500 text-white cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); removeFromWatchlist(movie.id); }}
                    >
                      <FaTrashAlt className="mr-1" /> Remove from Watchlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedMovie && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded w-full max-w-md mx-4">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <FaTimes size={18} />
            </button>
            <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full h-64 object-cover mb-4 rounded" />
            <h2 className="text-xl font-semibold mb-2">{selectedMovie.title}</h2>
            <p className="text-gray-700 mb-2">{selectedMovie.description}</p>
            <p className="text-gray-500 mb-2">Release Date: {selectedMovie.releaseDate}</p>
            <div className="flex items-center mb-2">
              <span className="text-gray-900 mr-1">Rating:</span>
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="text-gray-900">{selectedMovie.rating}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                className={`px-2 py-1 rounded flex items-center text-xs ${watchlist.some(watchlistMovie => watchlistMovie.id === selectedMovie.id) ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-green-500 text-white cursor-pointer'}`}
                onClick={() => addToWatchlist(selectedMovie)}
                disabled={watchlist.some(watchlistMovie => watchlistMovie.id === selectedMovie.id)}
              >
                {watchlist.some(watchlistMovie => watchlistMovie.id === selectedMovie.id) ? <FaCheck className="mr-1" /> : <FaStar className="mr-1" />} {watchlist.some(watchlistMovie => watchlistMovie.id === selectedMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <button
                className="px-2 py-1 rounded flex items-center text-xs bg-red-500 text-white cursor-pointer"
                onClick={() => removeFromWatchlist(selectedMovie.id)}
              >
                <FaTrashAlt className="mr-1" /> Remove from Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movie;
