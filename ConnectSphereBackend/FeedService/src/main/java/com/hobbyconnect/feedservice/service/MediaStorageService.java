package com.hobbyconnect.feedservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Converts uploaded images and videos into Base64 data-URI strings for
 * storage directly inside MongoDB documents.
 *
 * Why Base64 in Mongo?
 *  - No separate file server or CDN needed for serving media.
 *  - Frontend receives the data-URI and sets it straight as <img src> /
 *    <video src> — zero extra HTTP round-trips.
 *  - Suitable for a microservice that needs to be self-contained.
 *
 * Trade-off: document size grows ~33 % compared to raw binary (Base64
 * overhead), so per-file limits are enforced strictly.
 */
@Service
public class MediaStorageService {

    // ── Allowed MIME types ────────────────────────────────────────────────────

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/quicktime", "video/x-msvideo",   // .mp4 .mov .avi
            "video/webm", "video/mpeg"
    );

    // ── Size limits ───────────────────────────────────────────────────────────

    /** Maximum size per image file: 10 MB */
    private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;

    /** Maximum size per video file: 50 MB */
    private static final long MAX_VIDEO_BYTES = 50L * 1024 * 1024;

    /** Maximum number of images per post (mirrors Instagram's limit). */
    private static final int MAX_IMAGES = 10;

    /** Maximum number of videos per post. */
    private static final int MAX_VIDEOS = 3;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Validates and converts a list of image files to Base64 data-URI strings.
     *
     * @param files array of image MultipartFiles (may be null or empty)
     * @return list of "data:image/jpeg;base64,..." strings, empty if no files
     * @throws IOException              on read error
     * @throws IllegalArgumentException on validation failure
     */
    public List<String> storeImages(MultipartFile[] files) throws IOException {
        if (files == null || files.length == 0) return List.of();

        List<MultipartFile> nonEmpty = filterNonEmpty(files);
        if (nonEmpty.isEmpty()) return List.of();

        if (nonEmpty.size() > MAX_IMAGES) {
            throw new IllegalArgumentException(
                    "Too many images. Maximum allowed: " + MAX_IMAGES);
        }

        List<String> result = new ArrayList<>();
        for (MultipartFile file : nonEmpty) {
            validateMediaFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, "image");
            result.add(toDataUri(file));
        }
        return result;
    }

    /**
     * Validates and converts a list of video files to Base64 data-URI strings.
     *
     * @param files array of video MultipartFiles (may be null or empty)
     * @return list of "data:video/mp4;base64,..." strings, empty if no files
     * @throws IOException              on read error
     * @throws IllegalArgumentException on validation failure
     */
    public List<String> storeVideos(MultipartFile[] files) throws IOException {
        if (files == null || files.length == 0) return List.of();

        List<MultipartFile> nonEmpty = filterNonEmpty(files);
        if (nonEmpty.isEmpty()) return List.of();

        if (nonEmpty.size() > MAX_VIDEOS) {
            throw new IllegalArgumentException(
                    "Too many videos. Maximum allowed: " + MAX_VIDEOS);
        }

        List<String> result = new ArrayList<>();
        for (MultipartFile file : nonEmpty) {
            validateMediaFile(file, ALLOWED_VIDEO_TYPES, MAX_VIDEO_BYTES, "video");
            result.add(toDataUri(file));
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Reads the file bytes and encodes them into a RFC-2397 data-URI.
     * Result: "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
     */
    private String toDataUri(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        String encoded = Base64.getEncoder().encodeToString(bytes);
        return "data:" + file.getContentType() + ";base64," + encoded;
    }

    private void validateMediaFile(MultipartFile file,
                                   List<String> allowedTypes,
                                   long maxBytes,
                                   String kind) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid " + kind + " type '" + contentType +
                            "'. Allowed: " + String.join(", ", allowedTypes));
        }
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException(
                    kind + " file too large. Max size: " + (maxBytes / (1024 * 1024)) + " MB");
        }
    }

    private List<MultipartFile> filterNonEmpty(MultipartFile[] files) {
        List<MultipartFile> result = new ArrayList<>();
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) result.add(f);
        }
        return result;
    }
}
