
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useEffect } from "react";

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    router.push("/auth/sing-in"); 
  }, []);

  return (
    <main className={styles.main}>
     
    </main>
  );
}