import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Theme.module.css";
import Navbar from "../components/Navbar";
import Image, { StaticImageData } from "next/image";
import mott from "../public/Screenshot 2025-02-16 231237.png";
import missing from "../public/missingg.jpg";
import one from "../public/14.jpg";
import two from "../public/12.jpg";
import three from "../public/13.jpg";

const NFTCard = ({
  name,
  price,
  status,
  handleMint,
  img,
  law,
  setSelectedLaw,
}: {
  name: string;
  price: string;
  status: string;
  law: string;
  img: StaticImageData;
  handleMint: () => void;
  setSelectedLaw: Dispatch<SetStateAction<string>>;
}) => (
  <div className={styles.nftCard} onClick={() => setSelectedLaw(law)}>
    <div className={styles.cardContent}>
      <div className={styles.cardImage}>
        <Image
          unoptimized
          src={img}
          alt="Animated GIF"
          //   width={'100%'}
          //   height={'100%'}
        />
      </div>
      <h3 className={styles.cardTitle}>{name}</h3>
      <div className={styles.cardDetails}>
        <span className={styles.price} style={{ fontSize: "32px" }}>
          {price} <span style={{ fontSize: "0.75rem" }}>MON</span>
        </span>
        {status === "now" ? (
          <button
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              padding: "0.5rem 1.2rem",
              borderRadius: "9999px",
              cursor: "pointer",
              border: "none",
            }}
            onClick={handleMint}
          >
            Mint
          </button>
        ) : (
          <span className={styles.status}>{status}</span>
        )}
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const router = useRouter();
  const [selectedLaw, setSelectedLaw] = useState(
    "The Missing Tato Has Disappeared To The Tides Of The Monad Testnet, And It Is Up To The Nads To Find This Long Lost Tato, A Mint Search Party Has Commenced, And Its Imperative All Nads Take Part, The Lucky Nads Who Help Recover This Helpless Tato Will Get Rewarded With A Guaranteed Access To The Motatoes Ecosystem."
  );
  const handleMint = () => {
    router.push("/mint");
  };

  const nfts = [
    {
      name: "The True Tato",
      price: "∞",
      status: "incoming",
      img: mott,
      law: "mOTaTOEs ArE tHE MoST eGaLiTArIaN thInG We'Ve EvEr SeEn—sImPlE, PiXeLaTEd SpUDS, nO fUsS. IF It aLl cLiCkS, wHO KnOwS wHaT MiGhT hAPpEn ",
    },
    {
      name: "John W Rich Kid Tato",
      price: "∞",
      status: "incoming",
      img: one,
      law: "The Wendy's Fry Cook Of Monad Is The Epitome Of Nad Culture, His Purge Day Memes Captured The Heart Of So Many Nads, His Impact In Monad Lore Is Unlike No One Else, He Has Joined The Motatoes Ecosystem, He Also Cooks A Mean Steak.",
    },
    {
      name: "The Missing Tato",
      price: "1",
      status: "now",
      img: missing,
      law: "The Missing Tato Has Disappeared To The Tides Of The Monad Testnet, And It Is Up To The Nads To Find This Long Lost Tato, A Mint Search Party Has Commenced, And Its Imperative All Nads Take Part, The Lucky Nads Who Help Recover This Helpless Tato Will Get Rewarded With A Guaranteed Access To The Motatoes Ecosystem.",
    },
    {
      name: "Karma Tato",
      price: "∞",
      status: "incoming",
      img: two,
      law: "Leading Us Through The Nad Wisdom Of The Mach 2 Accelerator, Is The Cooolest Teacher Nad In Monad , And She Is A Motato Now, The Knowledge She Have Impacted Nads Is Unparalleled. We Love You Karma 💜",
    },
    {
      name: "Zayn Tato",
      price: "∞",
      status: "incoming",
      img: three,
      law: "The Most Popular Yapper Nad In All Of Monad, “Gm To Those Who Gm” He Says Everyday While Wearing The Brightest Smile A Nad Could Wear, Monad Lore Is Incomplete Without A Mention Of Zayn, It's Only Fair He Becomes A Motato 💜",
    },
  ];

  return (
    <>
      {/* <Navbar /> */}
      <div className={styles.container}>
        <main className={styles.containerNew}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Motatoes are live on Monad Testnet
            </h1>
            <p className={styles.heroText}>
              The Mint Search Party Is live On Day 1 Of Monad Testnet, Grab A
              Missing Tato, And Join The Search Party
            </p>
            <div className={styles.buttonGroup}>
              <button onClick={handleMint} className={styles.primaryButton}>
                Mint Now
              </button>
              {/* <button className={styles.secondaryButton}>Create</button> */}
            </div>
          </div>

          <div className={styles.nftGrid}>
            {nfts.map((nft, index) => (
              <NFTCard
                key={index}
                {...nft}
                handleMint={handleMint}
                setSelectedLaw={setSelectedLaw}
              />
            ))}
          </div>

          <div className={styles.hero}>
            <p className={styles.heroText}>{selectedLaw}</p>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
