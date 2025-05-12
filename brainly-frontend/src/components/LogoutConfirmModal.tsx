import { motion, AnimatePresence } from "framer-motion";

type LogoutConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ open, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] p-6 w-full max-w-sm text-cyan-100"
          >
            <h2 className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-cyan-400 drop-shadow-md">
              Confirm Logout
            </h2>
            <p className="text-sm text-cyan-200/80 mb-6">
              Are you sure you want to log out from your Second Brain?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-800 via-blue-700 to-purple-700 text-cyan-100 hover:brightness-125 transition shadow-md shadow-cyan-500/20"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white hover:brightness-125 transition shadow-lg shadow-pink-500/30"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
