import Image from "next/image"
import Link from "next/link"
import HeaderData from "./HeaderData"
import { Suspense } from "react"

const Header = async () => {
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/header.png"
            alt="logo"
            width={140}
            height={40}
            className="h-14 w-auto cursor-pointer"
          />
        </Link>
        <Suspense fallback={null}>
          <HeaderData />
        </Suspense>
      </div>
    </header>
  )
}

export default Header
