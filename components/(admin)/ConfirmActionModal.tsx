'use client';

import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Trash2, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'delete' | 'send';
  loading?: boolean;
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  loading = false,
}: Props) {
  const isDelete = action === 'delete';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Dialog.Panel className="w-full max-w-md rounded-xl bg-white/80 shadow-xl border border-gray-200 p-6 backdrop-blur-md">
            <Dialog.Title className="text-xl font-bold text-blue-900 flex items-center gap-2">
              {isDelete ? (
                <>
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Confirm Deletion
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-green-600" />
                  Send Receipt Email
                </>
              )}
            </Dialog.Title>

            <div className="mt-4 text-sm text-gray-800">
              {isDelete ? (
                <p>Are you sure you want to <strong>permanently delete</strong> this booking? This action cannot be undone.</p>
              ) : (
                <p>Do you want to <strong>send the receipt</strong> to the user’s email now?</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-white font-medium transition ${
                  isDelete
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading
                  ? isDelete
                    ? 'Deleting...'
                    : 'Sending...'
                  : isDelete
                  ? 'Delete'
                  : 'Send'}
              </button>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
