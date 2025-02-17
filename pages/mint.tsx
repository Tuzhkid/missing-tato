import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useUnclaimedNFTSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import animationData from "../public/confetti.json";
import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/Theme.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";
import Navbar from "../components/Navbar";
import missing from "../public/missingg.jpg";
import Image from "next/image";
import Link from "next/link";
import Lottie from "react-lottie";

// new id 5ec9d980533be21c962580687677c0f9
// new key t0FrTfMOHuPBNQJ0tWoQbi9vabkEcHLRlBpZJPeswtUIsuvt-GKQ68534KwM0pqkkukuiHWGAKyTjlTQoVrDhA

// old
// 7fFRLUeqN7STeC3GBi8dLk7s2_DEpKe6a_znHLUmQkmDaSz9UynTgdVFPSeDkObLgaqShMG_tozNw0LXICi_Rg
// Put Your NFT Drop Contract address from the dashboard here
//ca monad 0x49821Be6E632203343C91773BC014836E008BBb9  0x4d6F4aeDFC1f5853C9C8D1A4f59106739db2f3bC
const myNftDropContractAddress = "0xBa0C419521c6BA15390c42E24A7332E90d8c1E4c";

const Home: NextPage = () => {
  const [showConf, setShowConf] = useState(false);
  const { contract: nftDrop } = useContract(
    myNftDropContractAddress,
    "nft-drop"
  );

  const address = useAddress();
  const [quantity, setQuantity] = useState(1);

  const { data: contractMetadata } = useContractMetadata(nftDrop);
  // console.log(nftDrop, contractMetadata);

  const claimConditions = useClaimConditions(nftDrop);

  const activeClaimCondition = useActiveClaimConditionForWallet(
    nftDrop,
    address || ""
  );
  const claimerProofs = useClaimerProofs(nftDrop, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(nftDrop, {
    quantity,
    walletAddress: address || "",
  });
  const unclaimedSupply = useUnclaimedNFTSupply(nftDrop);
  const claimedSupply = useClaimedNFTSupply(nftDrop);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString();
  }, [claimedSupply.data, unclaimedSupply.data]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    let max;
    if (maxAvailable.lt(bnMaxClaimable)) {
      max = maxAvailable;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    unclaimedSupply.data,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  console.log("claimIneligibilityReasons", claimIneligibilityReasons.data);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !nftDrop
    );
  }, [
    activeClaimCondition.isLoading,
    nftDrop,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Claiming not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);
  // useEffect(() => {
  //   if (!address && window.ethereum) {
  //     window.ethereum.request({ method: 'eth_requestAccounts' });
  //   }
  // }, [address]);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    if (showConf) {
      // Show animation for 3 seconds
      const timer = setTimeout(() => {
        setShowConf(false);
      }, 3000);

      // Cleanup the timer
      return () => clearTimeout(timer);
    }
  }, [showConf]);

  return (
    <>
      {/* <Navbar /> */}
      {showConf && (
        <Lottie
          options={defaultOptions}
          height={"100vh"}
          width={"100vw"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 50,
          }}
        />
      )}
      <div className={styles.container}>
        <div style={{ position: "relative" }}>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Link style={{}} href={"/"}>
                <span
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    top: -50,
                    left: 0,
                  }}
                >
                  {"<--"} back
                </span>
              </Link>
              <div className={styles.mintInfoContainer}>
                <div className={styles.infoSide}>
                  {/* Image Preview of NFTs */}
                  <img
                    className={styles.image}
                    src={contractMetadata?.image}
                    alt={`${contractMetadata?.name} preview image`}                    
                  />
                </div>

                <div className={styles.imageSide}>
                  {/* Title of your NFT Collection */}
                  <h1 style={{ fontSize: "50px", margin: "0px" }}>
                    {contractMetadata?.name}
                  </h1>
                  {/* Description of your NFT Collection */}
                  <p className={styles.description}>
                    The Missing Tato Has Disappeared To The Tides Of The Monad
                    Testnet, And It Is Up To The Nads To Find This Long Lost
                    Tato, A Mint Search Party Has Commenced, And Its Imperative
                    All Nads Take Part, The Lucky Nads Who Help Recover This
                    Helpless Tato Will Get Rewarded With A Guaranteed Access To
                    The Motatoes Ecosystem.
                    <br />
                    <br />
                  </p>
                  <p
                    style={{
                      marginBottom: "20px",
                      fontSize: "20px",
                      fontFamily: "Times New Roman",
                    }}
                  >
                    Price: <span style={{ fontWeight: "700" }}>1 TMON</span>
                  </p>
                  <p
                    style={{
                      marginBottom: "20px",
                      fontSize: "20px",
                      fontFamily: "Times New Roman",
                    }}
                  >
                    Date:{" "}
                    <span style={{ fontSize: "20px", fontWeight: "700" }}>
                      Monad Testnet Day 1
                    </span>
                  </p>

                  {/* <div>
                Powered by thirdweb{" "}
                <a href="https://explorer.monad-devnet.devnet101.com/address/0x9e9E0D5c96aB9fE70eCD9d403d150cA512dC450e" target="_blank" rel="noreferrer">0x4982...BBb9</a>
              </div> */}

                  {claimConditions.data?.length === 0 ||
                  claimConditions.data?.every(
                    (cc) => cc.maxClaimableSupply === "0"
                  ) ? (
                    <div>
                      <h2>
                        This drop is not ready to be minted yet. (No claim
                        condition set)
                      </h2>
                    </div>
                  ) : (
                    <>
                      <p style={{ textDecoration: "underline" }}>Quantity</p>

                      <div className={styles.joinedQuantity}>
                        <div className={styles.quantityContainer}>
                          {/* <button
                          className={`${styles.quantityControlButton}`}
                          onClick={() => setQuantity(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          -
                        </button> */}

                          <h4
                            style={{
                              margin: "0px",
                              textAlign: "center",
                              width: "100%",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                          >
                            {quantity}
                          </h4>

                          {/* <button
                          className={`${styles.quantityControlButton}`}
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= maxClaimable}
                        >
                          +
                        </button> */}
                        </div>

                        <div className={styles.mintContainer}>
                          {isSoldOut ? (
                            <div>
                              <h2>Sold Out</h2>
                            </div>
                          ) : (
                            <Web3Button
                              contractAddress={nftDrop?.getAddress() || ""}
                              action={(cntr) => cntr.erc721.claim(quantity)}
                              isDisabled={!canClaim || buttonLoading}
                              onError={(err) => {
                                console.error(err);
                                alert(
                                  "There was an error while to claiming this NFT"
                                );
                              }}
                              onSuccess={() => {
                                setQuantity(1);
                                setShowConf(true);
                                // alert("Successfully claimed NFTs");
                              }}
                            >
                              {buttonLoading ? "Loading..." : buttonText}
                            </Web3Button>
                            // <></>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {/* Amount claimed so far */}
                  <div className={styles.mintCompletionArea}>
                    <div className={styles.mintAreaLeft}>
                      <p>Total Minted : </p>
                    </div>
                    <div className={styles.mintAreaRight}>
                      {claimedSupply && unclaimedSupply ? (
                        <p>
                          {" "}
                          <b>{numberClaimed}</b>
                          {" / "}
                          {numberTotal}
                        </p>
                      ) : (
                        // Show loading state if we're still loading the supply
                        <p>Loading...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="" style={{ marginTop: "60px" }}>
                <div className={styles.statsGrid}>
                  <div
                    className={styles.statCard}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className={styles.heroTitle}>{numberClaimed}/500</div>
                    {/* <div className={styles.heroText}>Pre-Launch</div> */}
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.heroTitle}>{numberClaimed}</div>
                    <div className={styles.heroText}>Total Minted</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.heroTitle}>500</div>
                    <div className={styles.heroText}>Total Supply</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.heroTitle}>100%</div>
                    <div className={styles.heroText}>Unique</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
