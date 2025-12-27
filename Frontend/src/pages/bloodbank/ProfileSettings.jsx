import { useState } from "react";

const profileSnapshot = {
  name: "LifeCare Blood Bank",
  licenseNumber: "BB-GJ-2021-4455",
  email: "lifecare@bloodbank.com",
  phone: "+91 9876543210",
  city: "Ahmedabad",
  address: "123 Medical District, Ahmedabad, Gujarat 380001",
  verificationStatus: "VERIFIED",
  establishedYear: "2021",
  capacity: "500 units",
};

export default function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileSnapshot);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profileSnapshot);
    setIsEditing(false);
  };

  return (
    <section className="rounded-3xl border border-white/60 bg-white p-6 shadow-[0_25px_60px_rgba(255,154,187,0.2)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
            Profile & Settings
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#31101e]">
            Blood Bank Identity
          </h3>
          <p className="mt-1 text-sm text-[#7c4a5e]">
            Ensure contact and license details stay current.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-2xl border border-pink-100 bg-white px-4 py-2 text-sm font-semibold text-[#ff4d6d] transition hover:border-[#ff4d6d]"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                Blood Bank Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                disabled
                className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-[#7c4a5e] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
                Established Year
              </label>
              <input
                type="text"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7c4a5e] mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#31101e] focus:border-[#ff4d6d] focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 rounded-2xl bg-linear-to-r from-[#ff4d6d] to-[#ff8fa3] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(255,77,109,0.35)] transition hover:scale-[1.02]"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm font-semibold text-[#ff4d6d] transition hover:border-[#ff4d6d]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <dl className="space-y-4 border-t border-pink-50 pt-4 text-sm">
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">Blood Bank Name</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.name}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">License Number</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.licenseNumber}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">Contact Email</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.email}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">Phone</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.phone}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">City</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.city}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">Address</dt>
              <dd className="font-semibold text-[#31101e] text-right max-w-md">
                {formData.address}
              </dd>
            </div>
            <div className="flex justify-between border-b border-pink-50 pb-3">
              <dt className="text-[#7c4a5e]">Established Year</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.establishedYear}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#7c4a5e]">Storage Capacity</dt>
              <dd className="font-semibold text-[#31101e]">
                {formData.capacity}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="flex-1 rounded-2xl bg-linear-to-r from-[#ff4d6d] to-[#ff8fa3] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(255,77,109,0.35)] transition hover:scale-[1.02]">
              Download Compliance PDF
            </button>
            <button className="flex-1 rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm font-semibold text-[#ff4d6d] transition hover:border-[#ff4d6d]">
              Change Password
            </button>
          </div>
        </>
      )}

      <div className="mt-6 rounded-2xl border border-pink-100 bg-linear-to-br from-[#ffe5ec] to-[#fff5f9] p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]/70">
          Account Security
        </p>
        <p className="mt-3 text-sm text-[#31101e]">
          Keep your account secure by regularly updating your password and ensuring your contact information is current. Any changes to license information must be verified by the admin team.
        </p>
      </div>
    </section>
  );
}
