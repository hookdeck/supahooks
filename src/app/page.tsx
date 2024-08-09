export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center flex-grow">
      <form method="POST" action="/dashboard" className="flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="text-slate-900 min-w-[400px] rounded-md p-2"
        />
        <button className="bg-slate-700 p-2 rounded-lg cursor-pointer">
          Pretend to login
        </button>
      </form>
    </div>
  );
}
