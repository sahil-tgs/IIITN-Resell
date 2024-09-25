import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Mock user data (replace with actual user data from your backend)
const user = {
  name: 'John Doe',
  email: 'johndoe@iiitn.ac.in',
  studentId: 'BT21CSE001',
  contactNumber: '+91 9876543210',
};

// Mock user's listed products (replace with actual data from your backend)
const userProducts = [
  { id: 1, name: 'Data Structures Textbook', price: 400, status: 'Active' },
  { id: 2, name: 'Scientific Calculator', price: 200, status: 'Sold' },
  { id: 3, name: 'Study Lamp', price: 300, status: 'Active' },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const { darkMode } = useTheme();
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!editedUser.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    if (!editedUser.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@iiitn\.ac\.in$/.test(editedUser.email)) {
      newErrors.email = 'Please use a valid IIITN email address (e.g., xyz@iiitn.ac.in)';
      isValid = false;
    }

    if (!editedUser.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
      isValid = false;
    } else if (!/^BT\d{2}(CSE|ECE)\d{3}$/.test(editedUser.studentId)) {
      newErrors.studentId = 'Invalid Student ID format. Use BTXXABCXXX (XX=numbers, ABC=CSE or ECE)';
      isValid = false;
    }

    if (!editedUser.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
      isValid = false;
    } else if (!/^\+91 \d{10}$/.test(editedUser.contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number format. Use +91 followed by 10 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the updated user data to your backend
      console.log('Updated user data:', editedUser);
      setIsEditing(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold mb-8">My Profile</h1>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg transition-colors duration-200`}>
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="studentId" className="block text-sm font-medium">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      id="studentId"
                      value={editedUser.studentId}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    {errors.studentId && <p className="mt-2 text-sm text-red-600">{errors.studentId}</p>}
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="contactNumber" className="block text-sm font-medium">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      id="contactNumber"
                      value={editedUser.contactNumber}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    {errors.contactNumber && <p className="mt-2 text-sm text-red-600">{errors.contactNumber}</p>}
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <dl className="px-4 py-5 sm:p-6 grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                  <dd className="mt-1 text-sm">{user.name}</dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                  <dd className="mt-1 text-sm">{user.email}</dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</dt>
                  <dd className="mt-1 text-sm">{user.studentId}</dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</dt>
                  <dd className="mt-1 text-sm">{user.contactNumber}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Listed Products</h2>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg transition-colors duration-200`}>
            <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {userProducts.map((product) => (
                <li key={product.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">{product.name}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        ₹{product.price}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Link to={`/products/${product.id}`} className="text-primary hover:text-blue-700">
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;