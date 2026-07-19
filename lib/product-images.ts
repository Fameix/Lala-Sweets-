import type { Product } from "@/types/catalogue"

type ProductImage = {
  src: string
  alt: string
  status: "temporary" | "missing"
  credit: string
  sourceUrl: string
  className?: string
}

const pexelsParams = "?auto=compress&cs=tinysrgb&w=900"
const cardPexelsParams = "?auto=compress&cs=tinysrgb&fit=crop&w=900&h=675"

const images = {
  milkshake: {
    src: `https://images.pexels.com/photos/14333988/pexels-photo-14333988.jpeg${cardPexelsParams}`,
    alt: "Temporary Pexels photo of a centered milkshake in a glass",
    status: "temporary",
    credit: "Pexels / Captured by Augustine",
    sourceUrl: "https://www.pexels.com/search/milkshake/",
    className: "object-center",
  },
  iceCream: {
    src: "/icecream-vanilla.png",
    alt: "Temporary Pexels photo of colorful ice cream bowls",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/icecream-vanilla.png",
  },
  fries: {
    src: "/snacks-golden-french-fries.png",
    alt: "Golden french fries in a tray",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/snacks-golden-french-fries.png",
  },
  masalaFries: {
    src: "/snacks-masala-fries.png",
    alt: "Masala fries in a black bowl",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/snacks-masala-fries.png",
  },
  nuggets: {
    src: "/snacks-chicken-nuggets.png",
    alt: "Chicken nuggets on a black plate",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/snacks-chicken-nuggets.png",
  },
  potatoSmilies: {
    src: "/snacks-potato-smilies.png",
    alt: "Potato smilies on a black plate",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/snacks-potato-smilies.png",
  },
  falooda: {
    src: "/icecream-falooda.png",
    alt: "Temporary Pexels photo of falooda dessert",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/icecream-falooda.png",
  },
  hotBeverage: {
    src: `https://images.pexels.com/photos/1931444/pexels-photo-1931444.jpeg${pexelsParams}`,
    alt: "Temporary Pexels photo of a focused cup of coffee",
    status: "temporary",
    credit: "Pexels / cup of coffee in focus",
    sourceUrl: "https://www.pexels.com/photo/selective-focus-photography-of-cup-of-coffee-1931444/",
  },
  coffee: {
    src: "/coffee-hot-beverage.png",
    alt: "Cup of hot coffee steaming on a saucer",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/coffee-hot-beverage.png",
  },
  hotTeaMilk: {
    src: "/milk-tea-hot-beverage.png",
    alt: "Cup of hot tea and milk steaming on a saucer",
    status: "temporary",
    credit: "Client-provided image",
    sourceUrl: "/milk-tea-hot-beverage.png",
  },
  tea: {
    src: `https://images.pexels.com/photos/8092278/pexels-photo-8092278.jpeg${pexelsParams}`,
    alt: "Temporary Pexels photo of tea being poured into a cup",
    status: "temporary",
    credit: "Pexels / tea being poured into a cup",
    sourceUrl: "https://www.pexels.com/photo/woman-pouring-tea-into-a-cup-8092278/",
  },
  soup: {
    src: `https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=900`,
    alt: "Temporary Pexels photo of soup in a bowl",
    status: "temporary",
    credit: "Pexels",
    sourceUrl: "https://www.pexels.com/search/soup/",
  },
} satisfies Record<string, ProductImage>

export function getProductImage(product: Product): ProductImage {
  if (product.product_type === "cake") {
    return {
      src: "/hero-banner.png",
      alt: `${product.display_name} image pending Master Bakery upload`,
      status: "missing",
      credit: "Master Bakery catalogue placeholder",
      sourceUrl: "/hero-banner.png",
      className: "object-center opacity-80",
    }
  }

  if (product.slug === "chocolate-milkshake") {
    return {
      src: "/milkshake-chocolate.png",
      alt: "Chocolate milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-chocolate.png",
      className: "object-center",
    }
  }

  if (product.slug === "mango-milkshake") {
    return {
      src: "/milkshake-mango.png",
      alt: "Mango milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-mango.png",
      className: "object-center",
    }
  }

  if (product.slug === "pista-milkshake") {
    return {
      src: "/milkshake-pista.png",
      alt: "Pista milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-pista.png",
      className: "object-center",
    }
  }

  if (product.slug === "strawberry-milkshake") {
    return {
      src: "/milkshake-strawberry.png",
      alt: "Strawberry milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-strawberry.png",
      className: "object-center",
    }
  }

  if (product.slug === "vanilla-milkshake") {
    return {
      src: "/milkshake-vanilla.png",
      alt: "Vanilla milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-vanilla.png",
      className: "object-center",
    }
  }

  if (product.slug === "cold-coffee") {
    return {
      src: "/milkshake-cold-coffee.png",
      alt: "Cold coffee milkshake with whipped cream in a bakery setting",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/milkshake-cold-coffee.png",
      className: "object-center",
    }
  }

  if (product.slug === "blackcurrant-ice-cream") {
    return {
      src: "/icecream-blackcurrant.png",
      alt: "Black currant ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-blackcurrant.png",
      className: "object-center",
    }
  }

  if (product.slug === "chocolate-ice-cream") {
    return {
      src: "/icecream-chocolate.png",
      alt: "Chocolate ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-chocolate.png",
      className: "object-center",
    }
  }

  if (product.slug === "strawberry-ice-cream") {
    return {
      src: "/icecream-strawberry.png",
      alt: "Strawberry ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-strawberry.png",
      className: "object-center",
    }
  }

  if (product.slug === "butterscotch-ice-cream") {
    return {
      src: "/icecream-butterscotch.png",
      alt: "Butterscotch ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-butterscotch.png",
      className: "object-center",
    }
  }

  if (product.slug === "vanilla-ice-cream") {
    return {
      src: "/icecream-vanilla.png",
      alt: "Vanilla ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-vanilla.png",
      className: "!object-contain object-center bg-black p-8 sm:p-10",
    }
  }

  if (product.slug === "pista-ice-cream") {
    return {
      src: "/icecream-pista.png",
      alt: "Pista ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-pista.png",
      className: "object-center",
    }
  }

  if (product.slug === "fruit-salad-with-ice-cream") {
    return {
      src: "/icecream-mixed-fruit.png",
      alt: "Fruit salad with ice cream in a glass bowl",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-mixed-fruit.png",
      className: "object-center",
    }
  }

  if (product.slug === "falooda") {
    return {
      src: "/icecream-falooda.png",
      alt: "Falooda dessert in a tall glass",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/icecream-falooda.png",
      className: "object-center",
    }
  }

  if (product.slug === "masala-fries") {
    return images.masalaFries
  }

  if (product.slug === "golden-french-fries") {
    return images.fries
  }

  if (product.slug === "potato-smilies") {
    return images.potatoSmilies
  }

  if (product.slug === "chicken-nuggets") {
    return images.nuggets
  }

  if (product.slug === "black-tea") {
    return {
      src: "/black-tea-hot-beverage.png",
      alt: "Cup of black tea steaming on a saucer",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/black-tea-hot-beverage.png",
    }
  }

  if (product.slug === "coffee") {
    return images.coffee
  }

  if (product.slug === "green-tea") {
    return {
      src: "/green-tea-hot-beverage.png",
      alt: "Cup of green tea steaming on a saucer",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/green-tea-hot-beverage.png",
    }
  }

  if (product.slug === "lemon-tea") {
    return {
      src: "/lemon-tea-hot-beverage.png",
      alt: "Cup of lemon tea steaming on a saucer",
      status: "temporary",
      credit: "Client-provided image",
      sourceUrl: "/lemon-tea-hot-beverage.png",
    }
  }

  if (product.slug === "tea-and-milk") {
    return images.hotTeaMilk
  }

  if (product.slug.includes("tea")) {
    return images.tea
  }

  if (product.normalized_category === "Milkshakes") {
    return images.milkshake
  }

  if (product.normalized_category === "Ice Cream and Desserts") {
    return images.iceCream
  }

  if (product.normalized_category === "Snacks and Fries" || product.normalized_category === "Quick Bites") {
    return images.fries
  }

  if (product.normalized_category === "Hot Beverages") {
    return images.hotBeverage
  }

  return images.soup
}
