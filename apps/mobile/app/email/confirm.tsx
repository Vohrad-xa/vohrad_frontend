import {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import {userApi} from '@vohrad/api-client';
import {useAuthStore, type StoreState} from '@vohrad/store';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {ThemedText, ThemedButton, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useAuth, useTheme} from '@/providers';
import {showAlert, formatDate} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function EmailConfirmScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    tenant_id?: string;
    tenantId?: string;
  }>();
  const setUser = useAuthStore((state: StoreState) => state.setUser);
  const router = useRouter();
  const {theme, ds} = useTheme();
  const {isAuthenticated} = useAuth();
  const styles = createStyles(theme, ds);
  const processedTokensRef = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const MIN_LOADING_MS = 600;

  const waitForMinimumLoading = async (startedAt: number) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_LOADING_MS - elapsed),
      );
    }
  };

  const token = useMemo(
    () => (typeof params.token === 'string' ? params.token : undefined),
    [params.token],
  );

  const rawTenantId = useMemo(() => {
    if (typeof params.tenant_id === 'string') {
      return params.tenant_id;
    }
    if (typeof params.tenantId === 'string') {
      return params.tenantId;
    }
    return undefined;
  }, [params.tenant_id, params.tenantId]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This confirmation link is invalid.');
      if (isAuthenticated) {
        router.replace('/(app)/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (processedTokensRef.current.has(token)) {
      return;
    }
    processedTokensRef.current.add(token);

    let isMounted = true;
    const confirm = async () => {
      setStatus('loading');
      const startedAt = Date.now();
      try {
        const user = await userApi.confirmPendingEmail(
          token,
          rawTenantId ?? null,
        );
        await waitForMinimumLoading(startedAt);
        if (!isMounted) {
          return;
        }
        setUser(user);
        setConfirmedAt(user.updated_at ? formatDate(user.updated_at) : null);
        setStatus('success');

        showAlert({
          title: 'Success',
          message: 'Your email has been confirmed successfully!',
        });
      } catch (err) {
        await waitForMinimumLoading(startedAt);
        if (!isMounted) {
          return;
        }
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to confirm your email. The link may have expired.';
        setMessage(msg);
        setStatus('error');
      }
    };

    confirm();

    return () => {
      isMounted = false;
    };
  }, [token, rawTenantId, setUser, router, isAuthenticated]);

  const navigateBackToApp = () => {
    if (isAuthenticated) {
      router.replace('/(app)/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <ThemedView style={[styles.container, styles.detunedPosition]}>
        <ThemedText variant="heading" style={styles.title}>
          Confirming your email…
        </ThemedText>
        <ThemedText variant="body" colorToken="muted" style={styles.subtitle}>
          Hang tight while we secure your account.
        </ThemedText>
      </ThemedView>
    );
  }

  if (status === 'success') {
    return (
      <ThemedView style={[styles.container, styles.detunedPosition]}>
        <ThemedText variant="heading" style={styles.title}>
          Email confirmed!
        </ThemedText>
        <ThemedText variant="body" colorToken="muted" style={styles.subtitle}>
          {confirmedAt
            ? `Your email was updated on ${confirmedAt}.`
            : 'Your email has been updated successfully.'}
        </ThemedText>
        <ThemedButton
          title={isAuthenticated ? 'Back to Profile' : 'Return to app'}
          variant="primary"
          onPress={() => {
            if (isAuthenticated) {
              router.replace('/(modals)/settings/profile');
            } else {
              router.replace('/(auth)/login');
            }
          }}
          style={styles.cta}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, styles.detunedPosition]}>
      <ThemedText variant="heading" style={styles.title}>
        Unable to confirm email
      </ThemedText>
      <ThemedText variant="body" colorToken="muted" style={styles.subtitle}>
        {message}
      </ThemedText>
      <ThemedButton
        title="Return to App"
        variant="primary"
        onPress={navigateBackToApp}
        style={styles.cta}
      />
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.xxl,
        gap: ds.spacing.lg,
      },
      detunedPosition: {
        transform: [{translateY: -ds.spacing.xxxl - ds.spacing.md}],
      },
      title: {
        textAlign: 'center',
      },
      subtitle: {
        textAlign: 'center',
        maxWidth: 320,
      },
      cta: {
        marginTop: ds.spacing.md,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 320,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
