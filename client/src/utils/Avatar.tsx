const Avatar = ({ name, size = 96 }: { name: string; size?: number }) => (
  <div
    className="flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
    style={{ width: size, height: size }}
  >
    {name?.charAt(0).toUpperCase()}
  </div>
);

export default Avatar;
