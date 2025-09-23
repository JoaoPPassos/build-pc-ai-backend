export const kabumScrapper = () =>{
  console.log("Scraping kabum...")
  const productElements = document.querySelectorAll(".productCard"); // Ajuste o seletor conforme a estrutura da página
  const values: { title: string; price: string; image: string, code:string }[] = [];
  productElements.forEach((el) => {
    const title = el.querySelector(".nameCard")?.innerHTML || "";
    const price = el.querySelector(".priceCard")?.innerHTML || "";
    const image =
      "https://kabum.com.br" +
        el.querySelector(".imageCard")?.getAttribute("src") || "";
    const code = el.getAttribute("data-smarthintproductid") || "";
    console.log(code)
    values.push({ title, price, image, code });
  });

  return values
}