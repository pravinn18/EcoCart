// ─────────────────────────────────────────────────────────────────────────────
// offerUtils.js  —  Single source of truth for all offer computation
// Used by: ProductCard, ProductDetails, Cart, Checkout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the full offer breakdown for one product + user context.
 * Mirrors the backend buildOfferBreakdown() so UI and DB are always in sync.
 *
 * @param {Object}  product      
 * @param {Object}  userInfo      
 * @param {Boolean} isNewUserItem 
 * @returns {{ finalPrice, discountPercent, discountStack, offerType, badge, badgeVariant, mrp, saved }}
 */
export const computeOffer = (
  product,
  userInfo = null,
  isNewUserItem = false,
) => {
  const EMPTY = {
    finalPrice: 0,
    discountPercent: 0,
    discountStack: [],
    offerType: null,
    badge: null,
    badgeVariant: "dark",
    mrp: 0,
    saved: 0,
  };

  if (!product) return EMPTY;

  const price = Number(product.price) || 0;
  const isPlus = Boolean(userInfo?.isPlusMember);
  const cap = isPlus ? 30 : 25;

  const isNewUser =
    isNewUserItem &&
    userInfo?.isNewUser === true &&
    Number(userInfo?.totalOrdersPlaced ?? 0) === 0 &&
    !userInfo?.firstOrderDone;

  const discountStack = [];
  let running = 0;

  const tryAdd = (label, percent, detail = null) => {
    const room = cap - running;
    if (room <= 0) return;
    const applied = Math.min(percent, room);
    const entry = { label, percent: applied };
    if (detail) entry.detail = detail;
    discountStack.push(entry);
    running += applied;
  };

  if (isNewUser) {
    tryAdd("Welcome Offer", 20);
  }

  if (product.expiryDate) {
    const daysLeft = Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000,
    );
    if (daysLeft > 0 && daysLeft <= 3)
      tryAdd("Expiring Soon", 20, `${daysLeft}d left`);
    else if (daysLeft <= 7)
      tryAdd("Expiring Soon", 15, `${daysLeft} days left`);
    else if (daysLeft <= 10)
      tryAdd("Expiring Soon", 10, `${daysLeft} days left`);
  }

  const stock = Number(product.stock) ?? 999;
  if (stock > 0 && stock <= 10) {
    tryAdd("Low Stock", 5, `${stock} left`);
  }

  const views = Number(product.views) || 0;
  if (views < 50) {
    tryAdd("Low Views", 5, `${views} views`);
  }
  const sales = Number(product.salesCount) || 0;
  if (sales < 5) {
    tryAdd("Low Sales", 5, `${sales} sold`);
  }

  if (isPlus) {
    tryAdd("Plus Member Bonus", 5);
  }

  const totalDiscount = Math.min(running, cap);
  const mrp = price;
  const finalPrice =
    totalDiscount > 0 ? Math.round(price * (1 - totalDiscount / 100)) : price;
  const saved = mrp - finalPrice;

  let badge = null;
  let badgeVariant = "dark";
  let offerType = null;

  if (isNewUser) {
    badge = `${totalDiscount}% OFF · Welcome`;
    badgeVariant = "welcome";
    offerType = "NEW USER OFFER";
  } else if (
    product.expiryDate &&
    Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000,
    ) <= 10
  ) {
    const d = Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000,
    );
    badge = `${totalDiscount}% OFF · Expiring`;
    badgeVariant = d <= 3 ? "critical" : "expiry";
    offerType = "EXPIRY OFFER";
  } else if (isPlus && totalDiscount > 0) {
    badge = `${totalDiscount}% OFF · Plus`;
    badgeVariant = "plus";
    offerType = "PLUS OFFER";
  } else if (totalDiscount > 0) {
    badge = `${totalDiscount}% OFF`;
    badgeVariant = "standard";
    offerType = "STANDARD OFFER";
  }

  return {
    finalPrice,
    discountPercent: totalDiscount,
    discountStack,
    offerType,
    badge,
    badgeVariant,
    mrp,
    saved,

    badgeColor: _variantToBg(badgeVariant),
    badgeText: _variantToText(badgeVariant),
    badgeShadow: _variantToShadow(badgeVariant),
  };
};
const VARIANT_STYLES = {
  welcome: { bg: "#7C3AED", text: "#fff", shadow: "rgba(124,58,237,0.35)" },
  critical: { bg: "#DC2626", text: "#fff", shadow: "rgba(220,38,38,0.4)" },
  expiry: { bg: "#EA580C", text: "#fff", shadow: "rgba(234,88,12,0.35)" },
  plus: { bg: "#D4AF37", text: "#000", shadow: "rgba(212,175,55,0.4)" },
  standard: { bg: "#1A302B", text: "#C28E77", shadow: "rgba(26,48,43,0.3)" },
  dark: { bg: "#1A302B", text: "#C28E77", shadow: "rgba(26,48,43,0.3)" },
};

const _variantToBg = (v) => (VARIANT_STYLES[v] || VARIANT_STYLES.dark).bg;
const _variantToText = (v) => (VARIANT_STYLES[v] || VARIANT_STYLES.dark).text;
const _variantToShadow = (v) =>
  (VARIANT_STYLES[v] || VARIANT_STYLES.dark).shadow;

export const getBadgeStyle = (variant) =>
  VARIANT_STYLES[variant] || VARIANT_STYLES.dark;

export const getNewUserOfferItemId = (cartItems, userInfo) => {
  const eligible =
    userInfo?.isNewUser === true &&
    Number(userInfo?.totalOrdersPlaced ?? 0) === 0 &&
    !userInfo?.firstOrderDone &&
    !userInfo?.isPlusMember;

  if (!eligible || !cartItems?.length) return null;

  return (
    [...cartItems].sort(
      (a, b) =>
        Number(a.discountPrice || a.price) - Number(b.discountPrice || b.price),
    )[0]?._id ?? null
  );
};
