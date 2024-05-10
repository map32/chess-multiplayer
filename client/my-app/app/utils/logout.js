'use client'
import { useRouter } from "next/navigation"
import Link from "next/link";

const sign = ({username}) => {
    const router = useRouter();
    const handleLogout = async () => {
        const res = await fetch('/api/logout',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: localStorage.getItem('token') }),
          });
        if (res.status == 200) {
            localStorage.clear();
            router.refresh()
        }
    }
    if (!username)
        return (
            <Link href="/signin" className="text-gray-600 hover:text-gray-800 mx-2">
                Sign In
            </Link>
        )
    else return (
        <a href="#" className="text-gray-600 hover:text-gray-800 mx-2" onClick={handleLogout}>Logout</a>
    )
}

export default sign;