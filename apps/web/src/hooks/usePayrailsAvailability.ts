import { useEffect, useRef, useState } from "react";
import { Payrails } from "@payrails/web-sdk";

type PayrailsClient = ReturnType<typeof Payrails.init>;

type GooglePayMerchantInfo = {
  merchantId?: string;
  merchantName?: string;
};

type WalletAvailability = {
  googlePay: boolean;
  applePay: boolean;
};

type UsePayrailsAvailabilityProps = {
  /**
   * @summary Initialized Payrails client instance.
   * Pass `undefined` while the client is still loading.
   */
  payrailsClient: PayrailsClient | undefined;
  /**
   * @summary Optional Google Pay merchant info required for availability check.
   * `merchantId` is not needed in TEST environment.
   * @see https://docs.payrails.com/docs/elements#google-pay-availability
   */
  googlePayMerchantInfo?: GooglePayMerchantInfo;
};

/**
 * @summary Checks availability of Google Pay and Apple Pay wallets
 * using the Payrails Elements SDK.
 *
 * This is only necessary when you need to know availability **before**
 * rendering the elements. The `googlePayButton` and `applePayButton`
 * elements have availability checks built-in and will not render if the
 * browser is unsupported.
 *
 * @see https://docs.payrails.com/docs/elements#google-pay-availability
 * @see https://docs.payrails.com/docs/elements#apple-pay-availability
 */
export const usePayrailsAvailability = ({
  payrailsClient,
  googlePayMerchantInfo,
}: UsePayrailsAvailabilityProps) => {
  const [availability, setAvailability] = useState<WalletAvailability>({
    googlePay: false,
    applePay: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  /**
   * @summary Track whether we've already run the check for this client instance
   * to avoid redundant async calls on re-renders.
   */
  const checkedClientRef = useRef<PayrailsClient | undefined>(undefined);

  useEffect(() => {
    if (!payrailsClient) return;
    if (checkedClientRef.current === payrailsClient) return;

    const cancelledRef = { current: false };
    setIsChecking(true);

    (async () => {
      try {
        const [googlePay, applePay] = await Promise.all([
          payrailsClient
            .isGooglePayAvailable(googlePayMerchantInfo)
            .catch(() => {
              return false;
            })
            .then((response) => {
              return response;
            }),
          payrailsClient
            .isApplePayAvailable()
            .catch(() => {
              return false;
            })
            .then((response) => {
              return response;
            }),
        ]);

        if (cancelledRef.current) return;

        checkedClientRef.current = payrailsClient;
        setAvailability({ googlePay, applePay });
      } catch {
        if (!cancelledRef.current) {
          setAvailability({ googlePay: false, applePay: false });
        }
      } finally {
        if (!cancelledRef.current) {
          setIsChecking(false);
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [payrailsClient]);

  return {
    googlePayAvailable: availability.googlePay,
    applePayAvailable: availability.applePay,
    isChecking,
  };
};
