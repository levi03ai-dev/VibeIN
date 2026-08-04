package com.vibe;

import android.media.audiofx.Equalizer;
import android.media.AudioManager;
import android.content.Context;
import android.os.Build;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class AudioEQModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "AudioEQModule";
    private final ReactApplicationContext reactContext;
    private Equalizer equalizer;
    private boolean initialized = false;

    public AudioEQModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    private void ensureInitialized(Promise promise) {
        try {
            if (equalizer == null) {
                int sessionId = getAudioSessionId();
                if (sessionId > 0) {
                    equalizer = new Equalizer(0, sessionId);
                } else {
                    equalizer = new Equalizer(0, 0);
                }
            }
            initialized = true;
        } catch (Exception e) {
            promise.reject("EQ_INIT_ERROR", "Failed to init Equalizer: " + e.getMessage(), e);
        }
    }

    private int getAudioSessionId() {
        try {
            AudioManager am = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
            if (am != null) return am.getAudioSessionId();
        } catch (Exception ignored) {}
        return 0;
    }

    @ReactMethod
    public void init(Promise promise) {
        try {
            ensureInitialized(promise);
            if (initialized) promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_INIT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getNumberOfBands(Promise promise) {
        try {
            ensureInitialized(promise);
            promise.resolve(equalizer.getNumberOfBands());
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getBandFreqRange(int band, Promise promise) {
        try {
            ensureInitialized(promise);
            short[] range = equalizer.getBandFreqRange((short) band);
            WritableArray arr = Arguments.createArray();
            arr.pushDouble(range[0]);
            arr.pushDouble(range[1]);
            promise.resolve(arr);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getBandLevel(int band, Promise promise) {
        try {
            ensureInitialized(promise);
            short level = equalizer.getBandLevel((short) band);
            promise.resolve((double) level);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setBandLevel(int band, int levelMillibels, Promise promise) {
        try {
            ensureInitialized(promise);
            equalizer.setBandLevel((short) band, (short) levelMillibels);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setBands(ReadableArray levels, Promise promise) {
        try {
            ensureInitialized(promise);
            short numBands = equalizer.getNumberOfBands();
            for (int i = 0; i < levels.size() && i < numBands; i++) {
                equalizer.setBandLevel((short) i, (short) levels.getInt(i));
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getPresets(Promise promise) {
        try {
            ensureInitialized(promise);
            int count = equalizer.getNumberOfPresets();
            WritableArray arr = Arguments.createArray();
            for (int i = 0; i < count; i++) {
                arr.pushString(equalizer.getPresetName((short) i));
            }
            promise.resolve(arr);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void usePreset(int presetIndex, Promise promise) {
        try {
            ensureInitialized(promise);
            equalizer.usePreset((short) presetIndex);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void enabled(boolean enable, Promise promise) {
        try {
            ensureInitialized(promise);
            equalizer.setEnabled(enable);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void release(Promise promise) {
        try {
            if (equalizer != null) {
                equalizer.setEnabled(false);
                equalizer.release();
                equalizer = null;
            }
            initialized = false;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EQ_ERROR", e.getMessage(), e);
        }
    }
}
