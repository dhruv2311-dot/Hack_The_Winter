const profileSnapshot = {
  name: "City Care Hospital",
  registrationNumber: "HOSP-GJ-2020-8899",
  email: "citycare@hospital.com",
  phone: "+91 9123456789",
  city: "Ahmedabad",
  verificationStatus: "VERIFIED",
  address:
    "Satellite Road, Near Metro Station, Ahmedabad, Gujarat - 380015",
  specialties: ["Cardiology", "Trauma Care", "Neonatology"],
};

export default function HospitalProfile() {
  return (
    <section className="space-y-6 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_30px_60px_rgba(77,10,15,0.12)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f0f1a]">
            Profile & Settings
          </p>
          <h3 className="text-2xl font-semibold text-[#2f1012]">
            Hospital Identity
          </h3>
          <p className="text-sm text-[#7a4c4c]">
            Maintain licensed information synced with SEBN compliance desk.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-[#f3c9c0] px-5 py-2 text-xs font-semibold text-[#8f0f1a] transition hover:border-[#8f0f1a]">
            Update Details
          </button>
          <button className="rounded-full bg-linear-to-r from-[#8f0f1a] to-[#c62832] px-5 py-2 text-xs font-semibold text-white shadow-[0_15px_35px_rgba(143,15,26,0.25)]">
            Download SOP Pack
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-[#f6ddd4] bg-[#fff9f6] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b05f09]">
            Registration Details
          </p>
          <dl className="mt-4 space-y-3 text-sm text-[#553334]">
            <div className="flex justify-between border-b border-[#f6ddd4] pb-2">
              <dt>Hospital Name</dt>
              <dd className="font-semibold text-[#2f1012]">
                {profileSnapshot.name}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#f6ddd4] pb-2">
              <dt>Registration Number</dt>
              <dd className="font-semibold text-[#2f1012]">
                {profileSnapshot.registrationNumber}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Verification Status</dt>
              <dd className="font-semibold text-[#1f7a3a]">
                {profileSnapshot.verificationStatus}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-[#f6ddd4] bg-[#fff9f6] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b05f09]">
            Contact
          </p>
          <dl className="mt-4 space-y-3 text-sm text-[#553334]">
            <div className="flex justify-between border-b border-[#f6ddd4] pb-2">
              <dt>Email</dt>
              <dd className="font-semibold text-[#2f1012]">
                {profileSnapshot.email}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#f6ddd4] pb-2">
              <dt>Phone</dt>
              <dd className="font-semibold text-[#2f1012]">
                {profileSnapshot.phone}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>City</dt>
              <dd className="font-semibold text-[#2f1012]">
                {profileSnapshot.city}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="rounded-2xl border border-[#f6ddd4] bg-[#fff9f6] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b05f09]">
          Facility Footprint
        </p>
        <p className="mt-3 text-sm text-[#6a3a3a]">{profileSnapshot.address}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#8f0f1a]">
          {profileSnapshot.specialties.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#f3c9c0] bg-white px-4 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
