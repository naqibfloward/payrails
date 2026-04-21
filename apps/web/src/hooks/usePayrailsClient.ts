import { useEffect, useRef, useState } from "react";
import { Payrails } from "@payrails/web-sdk";
import "@payrails/web-sdk/payrails-styles.css";

type PayrailsClient = ReturnType<typeof Payrails.init>;
type InitConfig = Parameters<typeof Payrails.init>[0];
type InitOptions = Parameters<typeof Payrails.init>[1];

/**
 * @summary WorkflowExecution is passed to `onClientInitialized` after the SDK
 * has fully initialized. Expose it so callers can store the executionId for
 * subsequent amount-update or lookup-action calls.
 * @see https://docs.payrails.com/docs/sdk#initializing-the-sdk
 */
type WorkflowExecution = Parameters<
  NonNullable<
    NonNullable<NonNullable<InitOptions>["events"]>["onClientInitialized"]
  >
>[0];

type UsePayrailsClientProps = {
  /**
   * @summary The SDK config object fetched from your server-side application.
   * Pass `undefined` while the fetch is in-flight — the hook will initialize
   * as soon as a non-undefined value is received.
   * @see https://docs.payrails.com/reference/clientinit
   */
  config: InitConfig | undefined;
  /**
   * @summary Payrails environment to run against.
   * @default 'TEST'
   */
  environment?: "TEST" | "PRODUCTION";
  /**
   * @summary Return URLs used after full-page redirects (e.g. 3DS, redirect-based payment methods).
   * @see https://docs.payrails.com/docs/sdk#return-info
   */
  returnInfo?: {
    success: string;
    cancel: string;
    error: string;
    pending?: string;
  };
  /**
   * @summary Called once the Payrails client has finished initializing.
   * Receives the WorkflowExecution so you can store `executionId` for
   * amount updates or lookup-action calls.
   * @see https://docs.payrails.com/docs/sdk#initializing-the-sdk
   */
  onClientInitialized?: (execution: WorkflowExecution) => void;
  /**
   * @summary Called when the current client session expires.
   * Return a fresh SDK init config from your backend to let the hook
   * automatically reinitialize the client without a full page reload.
   * @see https://docs.payrails.com/docs/sdk#refresh-client-session
   */
  onSessionExpired?: () => Promise<InitConfig>;
};

type UsePayrailsClientReturn = {
  /** The initialized Payrails client, or `undefined` while loading. */
  payrailsClient: PayrailsClient | undefined;
  /** `true` while `Payrails.init` is running. */
  isInitializing: boolean;
  /** Populated if `Payrails.init` throws. */
  error: Error | undefined;
};

/**
 * @summary Initializes the Payrails Web SDK client and returns it once ready.
 *
 * Pass the returned `payrailsClient` directly into `usePayrails` and
 * `usePayrailsAvailability`.
 *
 * The client is re-initialized automatically when `config` changes (i.e. when
 * you fetch a fresh workflow execution from your backend). If `config` is
 * `undefined` (still loading), initialization is deferred until it arrives.
 *
 * @example
 * ```tsx
 * const { payrailsClient, isInitializing } = usePayrailsClient({
 *   config,
 *   environment: 'TEST',
 *   returnInfo: {
 *     success: '/order/success',
 *     cancel: '/order/cancel',
 *     error: '/order/error',
 *   },
 *   onClientInitialized: (execution) => {
 *     setExecutionId(execution.executionResponse.id);
 *   },
 *   onSessionExpired: async () => {
 *     const freshConfig = await fetchPayrailsConfig();
 *     return freshConfig;
 *   },
 * });
 * ```
 *
 * @see https://docs.payrails.com/docs/sdk#initializing-the-sdk
 */
export const usePayrailsClient = ({
  config,
  environment = "TEST",
  returnInfo,
  onClientInitialized,
  onSessionExpired,
}: UsePayrailsClientProps): UsePayrailsClientReturn => {
  const [payrailsClient, setPayrailsClient] = useState<
    PayrailsClient | undefined
  >(undefined);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * @summary Keep callbacks in refs so that changing an inline arrow function
   * never triggers a full client re-initialization.
   */
  const onClientInitializedRef = useRef(onClientInitialized);
  const onSessionExpiredRef = useRef(onSessionExpired);

  useEffect(() => {
    onClientInitializedRef.current = onClientInitialized;
  }, [onClientInitialized]);

  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  useEffect(() => {
    if (!config) return;

    const cancelledRef = { current: false };

    setIsInitializing(true);
    setError(undefined);

    try {
      const client = Payrails.init(config, {
        environment: environment as NonNullable<InitOptions>["environment"],
        returnInfo,
        events: {
          onClientInitialized: (execution: WorkflowExecution) => {
            if (!cancelledRef.current) {
              onClientInitializedRef.current?.(execution);
            }
          },
          /**
           * @summary When the session expires, delegate to the caller to fetch
           * a fresh config. The resolved value is forwarded back to the SDK so
           * it can reinitialize itself transparently.
           * @see https://docs.payrails.com/docs/sdk#refresh-client-session
           */
          onSessionExpired: onSessionExpiredRef.current
            ? async () => {
                const freshConfig = await onSessionExpiredRef.current!();
                return freshConfig;
              }
            : undefined,
        },
      });

      if (!cancelledRef.current) {
        setPayrailsClient(client);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setPayrailsClient(undefined);
      }
    } finally {
      if (!cancelledRef.current) {
        setIsInitializing(false);
      }
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [config, environment, JSON.stringify(returnInfo)]);

  return { payrailsClient, isInitializing, error };
};
