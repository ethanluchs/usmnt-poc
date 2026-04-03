

//will take in incorrect guesses from parent 
export default function BottomBar({ incorrectGuesses = ["Pulisic", "Garnacho"] }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pt-3 pb-3 backdrop-blur-sm bg-[#ede8d0]/70 dark:bg-black/70 rounded-t-xl">
            <div className="flex gap-2">
                <input type="text" placeholder="Guess a player..." className="border rounded placeholder:text-gray-700 dark:placeholder:text-gray-400 border-black dark:border-[#ede8d0] bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] px-3 py-2 outline-none" />
                <button className="border border-black dark:border-[#ede8d0] rounded px-4 py-2 bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] hover:bg-black hover:text-[#ede8d0] dark:hover:bg-[#ede8d0] dark:hover:text-black active:scale-95 transition-all">Guess</button>
                <button className="border border-black dark:border-[#ede8d0] rounded px-4 py-2 bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] hover:bg-black hover:text-[#ede8d0] dark:hover:bg-[#ede8d0] dark:hover:text-black active:scale-95 transition-all">Next Stop →</button>
            </div>

            <div className="flex gap-2 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`border rounded px-2 py-1 text-sm min-w-[80px] text-center ${incorrectGuesses[i] ? "border-red-400 bg-red-100 dark:bg-red-950 text-red-500" : "border-gray-300 dark:border-gray-700 bg-[#ede8d0] dark:bg-black text-transparent"}`}>
                        {incorrectGuesses[i] || ""}
                    </span>
                ))}
            </div>
        </div>
    )
}
