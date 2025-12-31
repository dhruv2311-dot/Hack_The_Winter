import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Stethoscope,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { getMyCamps } from "../../services/ngoApi";
import { createResourceRequest, getNgoRequests, getVerifiedBloodBanks } from "../../services/resourceRequestApi";

export default function ConnectivityGrid() {
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]); // State for Blood Banks
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCamp, setSelectedCamp] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    organizationName: "",
    organizerName: "",
    equipmentCount: "",
    doctorCount: "",
    campId: "",
    bloodBankId: "" // Added field
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedCamp]);

  const fetchInitialData = async () => {
    try {
      const campsRes = await getMyCamps();
      if (campsRes.data?.success) {
        // Backend returns: { success: true, data: [camps...] }
        setCamps(campsRes.data.data || []);
      }

      // Fetch Blood Banks
      const bbRes = await getVerifiedBloodBanks();
      if (bbRes.data?.success) {
        setBloodBanks(bbRes.data.data);
      }

      await fetchRequests();
    } catch (error) {
      console.error("Error fetching initial data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getNgoRequests(selectedCamp);
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createResourceRequest(formData);
      if (res.data?.success) {
        toast.success("Request created successfully!");
        setIsModalOpen(false);
        setFormData({
          organizationName: "",
          organizerName: "",
          equipmentCount: "",
          doctorCount: "",
          campId: "",
          bloodBankId: ""
        });
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request");
    }
  };

  const filteredRequests = requests.filter(req =>
    req.campName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="rounded-[32px] border border-[#ffe5ed] bg-white p-8 shadow-[0_35px_90px_rgba(42,8,20,0.08)]">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ff4d6d]">
              Resource Coordination
            </p>
            <h3 className="text-2xl font-semibold text-[#2a0814]">
              Blood Bank Connectivity
            </h3>
            <p className="text-sm text-[#7a4456] mt-1">
              Request equipment and medical staff for your donation camps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm w-full sm:w-64 focus:outline-none focus:border-[#ff4d6d]"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedCamp}
                onChange={(e) => setSelectedCamp(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-full border border-gray-200 text-sm appearance-none bg-white focus:outline-none focus:border-[#ff4d6d] cursor-pointer"
              >
                <option value="all">All Camps</option>
                {Array.isArray(camps) && camps.map(camp => (
                  <option key={camp._id} value={camp._id}>{camp.campName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#ff4d6d] hover:bg-[#ff3355] px-5 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Request
            </button>
          </div>
        </header>

        {/* Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              <p>No resource requests found.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <article key={req._id} className="group relative overflow-hidden rounded-3xl border border-[#ffe0e8] bg-[#fff9fb] p-6 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                    {req.status}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-[#2a0814] mb-1 group-hover:text-[#ff4d6d] transition-colors line-clamp-1">
                  {req.campName}
                </h4>
                <p className="text-xs text-[#7a4456] mb-4 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {req.location || "Location N/A"}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3 border border-pink-50">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Equipment</p>
                    <div className="flex items-center gap-2 text-[#2a0814]">
                      <Briefcase className="h-4 w-4 text-[#ff4d6d]" />
                      <span className="font-semibold">{req.equipmentCount}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-pink-50">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Doctors</p>
                    <div className="flex items-center gap-2 text-[#2a0814]">
                      <Stethoscope className="h-4 w-4 text-[#ff4d6d]" />
                      <span className="font-semibold">{req.doctorCount}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-pink-100 pt-3 flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {req.startDate ? new Date(req.startDate).toLocaleDateString() : "TBD"}
                  </span>
                  {req.status === 'rejected' && req.rejectionReason && (
                    <span className="text-red-500 font-medium" title={req.rejectionReason}>
                      Reason: {req.rejectionReason}
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-50 border border-pink-100 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-[#2a0814] mb-4">
              Create Resource Request
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              Fill in the details below to request resources for your camp.
            </Dialog.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Camp</label>
                <select
                  required
                  value={formData.campId}
                  onChange={(e) => setFormData({ ...formData, campId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-[#ff4d6d] focus:outline-none bg-white appearance-none"
                >
                  <option value="">-- Select Camp --</option>
                  {Array.isArray(camps) && camps.map(c => (
                    <option key={c._id} value={c._id}>{c.campName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  required
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:border-[#ff4d6d] focus:outline-none"
                  placeholder="e.g. Red Cross"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
                <input
                  required
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:border-[#ff4d6d] focus:outline-none"
                  placeholder="Contact Person Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Count</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.equipmentCount}
                    onChange={(e) => setFormData({ ...formData, equipmentCount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:border-[#ff4d6d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Count</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.doctorCount}
                    onChange={(e) => setFormData({ ...formData, doctorCount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:border-[#ff4d6d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Blood Bank</label>
                <select
                  required
                  value={formData.bloodBankId}
                  onChange={(e) => setFormData({ ...formData, bloodBankId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-[#ff4d6d] focus:outline-none bg-white appearance-none"
                >
                  <option value="">-- Select Blood Bank --</option>

                  {Array.isArray(bloodBanks) && bloodBanks.map(bb => (
                    <option key={bb._id} value={bb._id}>{bb.name} ({bb.city})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-[#ff4d6d] hover:bg-[#ff3355] rounded-full shadow-lg shadow-pink-200"
                >
                  Submit Request
                </button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </section>
  );
}
