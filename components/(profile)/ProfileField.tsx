"use client"

interface ProfileFieldProps {
  label: string
  name: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export default function ProfileField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
}: ProfileFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1 block w-full border rounded-lg px-3 py-2 ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "text-gray-800 focus:ring-2 focus:ring-blue-500"
        }`}
      />
    </div>
  )
}
