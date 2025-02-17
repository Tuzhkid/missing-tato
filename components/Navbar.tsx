"use client";
import { useState } from "react";
import styles from "../styles/Theme.module.css";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <Link href={"/"} style={{ color: "white", cursor: 'pointer' }}>
        <h1 className={styles.logo} style={{ cursor: 'pointer' }}>Metacollect</h1>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/mint">Mint NFT</Link>       
      </div>
      
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/mint">Mint NFT</Link>          
        </div>
      )}
    </nav>
  );
};

export default Navbar;
