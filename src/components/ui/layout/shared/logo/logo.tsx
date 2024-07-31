import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image src={'/img/logo_binus.png'} alt="logo" height={50} width={90} style={{ marginTop: "20px" }} priority />
    </LinkStyled>
  );
};

export default Logo;
