import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DesignStudioPanel } from "@/features/studio/studio-panels";
import { resolveLayoutDetailCapabilities } from "@/domain/render";
import { visualScheduleProject } from "../../fixtures/visual/schedules";

describe("layout design inspector", () => {
  it("uses the compact four-group hierarchy without numbered cards or promotional copy", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={project.design}
        subjects={project.schedule}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    const structure = screen.getByRole("region", { name: "Structure" });
    const appearance = screen.getByRole("region", { name: "Appearance" });
    const schedule = screen.getByRole("region", { name: "Schedule" });
    const media = screen.getByRole("region", {
      name: "Media & Decoration",
    });
    expect(
      structure.compareDocumentPosition(appearance) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      appearance.compareDocumentPosition(schedule) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      schedule.compareDocumentPosition(media) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(structure).getByRole("heading", { name: "Layout" }),
    ).toBeVisible();
    expect(
      within(structure).getByRole("heading", { name: "Style" }),
    ).toBeVisible();
    expect(
      within(appearance).getByRole("heading", { name: "Color Palette" }),
    ).toBeVisible();
    expect(
      within(schedule).getByRole("heading", { name: "Subject Colors" }),
    ).toBeVisible();
    expect(
      within(media).getByRole("heading", { name: "Stickers" }),
    ).toBeVisible();
    expect(screen.queryByText("Start with structure")).toBeNull();
    expect(screen.queryByText("Make it yours")).toBeNull();
    expect(screen.queryByText(/Shape the layout, color, content/)).toBeNull();
  });

  it("offers compact Subject Colors modes and custom controls only for Cards and Grid", () => {
    const project = visualScheduleProject();
    const onMode = vi.fn();
    const { rerender } = render(
      <DesignStudioPanel
        design={project.design}
        subjects={project.schedule}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities(
          "cards",
          project.deviceVariants[0]!,
        )}
        onSubjectColorMode={onMode}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Subject Colors" }),
    ).toBeVisible();
    const automatic = screen.getByRole("radio", { name: "Automatic" });
    expect(automatic).toHaveAttribute("aria-checked", "true");
    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Subject color mode" }),
      ).getByRole("radio", { name: "Custom" }),
    );
    expect(onMode).toHaveBeenCalledWith("custom");

    rerender(
      <DesignStudioPanel
        design={{
          ...project.design,
          subjectColors: {
            mode: "custom",
            singleColor: null,
            bySubjectId: {
              [project.schedule[0]!.id]: "#123456",
              [project.schedule[2]!.id]: "#654321",
            },
          },
        }}
        subjects={project.schedule}
        visibleFields={project.design.visibleFields}
        activeLayout="grid"
        detailCapabilities={resolveLayoutDetailCapabilities(
          "grid",
          project.deviceVariants[0]!,
        )}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("CS.412 HEX")).toHaveValue("#123456");
    expect(screen.queryByLabelText("THESIS1 HEX")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Reset custom colors" }),
    ).toBeVisible();

    rerender(
      <DesignStudioPanel
        design={project.design}
        subjects={project.schedule}
        visibleFields={project.design.visibleFields}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities(
          "minimal",
          project.deviceVariants[0]!,
        )}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: "Subject Colors" }),
    ).toBeNull();
  });

  it("shows only active controls for title and compact Grid details", () => {
    const project = visualScheduleProject();
    const phone = project.deviceVariants[0]!;
    const common = {
      visibleFields: project.design.visibleFields,
      activeLayout: "grid" as const,
      detailCapabilities: resolveLayoutDetailCapabilities("grid", phone),
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...common}
        design={{
          ...project.design,
          wallpaperTitle: { ...project.design.wallpaperTitle, visible: false },
        }}
      />,
    );

    expect(screen.queryByLabelText("Title")).toBeNull();
    expect(screen.getByText("Subject code")).toBeVisible();
    expect(screen.getByText("Always shown")).toBeVisible();
    expect(screen.queryByRole("checkbox", { name: "Section" })).toBeNull();
    expect(screen.queryByText("Larger Grid devices only")).toBeNull();

    rerender(
      <DesignStudioPanel
        {...common}
        design={{
          ...project.design,
          wallpaperTitle: {
            ...project.design.wallpaperTitle,
            visible: true,
            text: "Second Semester",
          },
        }}
      />,
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Second Semester");
  });

  it("does not reset preserved Design state when contextual sections unmount and return", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const subjectId = project.schedule[0]!.id;
    const onTheme = vi.fn();
    const onTypography = vi.fn();
    const onSubjectColorMode = vi.fn();
    const onBackground = vi.fn();
    const preservedDesign = {
      ...project.design,
      themeId: "custom" as const,
      customPalette: {
        basedOnPaletteId: "matcha-study" as const,
        canvas: "#F5F3E9",
        primary: "#2F4634",
        secondary: "#DDE5D3",
        accent: "#8FA276",
        surface: "#FBFAF4",
        border: "#BCC8B0",
      },
      typography: { presetId: "playfair-inter" as const },
      background: {
        mode: "gradient" as const,
        gradient: {
          color1: "#112233",
          color2: "#AABBCC",
          direction: 45 as const,
        },
      },
      subjectColors: {
        mode: "custom" as const,
        singleColor: null,
        bySubjectId: { [subjectId]: "#123456" },
      },
    };
    const common = {
      design: preservedDesign,
      subjects: project.schedule,
      visibleFields: project.design.visibleFields,
      onTheme,
      onTypography,
      onSubjectColorMode,
      onBackground,
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...common}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
      />,
    );
    expect(screen.getByLabelText("CS.412 HEX")).toHaveValue("#123456");
    expect(
      screen.getByText("Playfair Display + Inter", {
        selector: "summary span",
      }),
    ).toBeVisible();
    expect(screen.getByText("Based on Matcha Study")).toBeVisible();

    rerender(
      <DesignStudioPanel
        {...common}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities("minimal", variant)}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: "Subject Colors" }),
    ).toBeNull();
    expect(screen.queryByRole("heading", { name: "Photos" })).toBeNull();
    expect(screen.getByText("To bottom-right")).toBeVisible();

    rerender(
      <DesignStudioPanel
        {...common}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[{ id: "photo-one", filename: "campus.jpg", caption: "" }]}
      />,
    );
    const structure = screen.getByRole("region", { name: "Structure" });
    expect(
      within(structure).getByRole("heading", { name: "Photos" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Subject Colors" }),
    ).toBeNull();

    rerender(
      <DesignStudioPanel
        {...common}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
      />,
    );
    expect(screen.getByLabelText("CS.412 HEX")).toHaveValue("#123456");
    expect(onTheme).not.toHaveBeenCalled();
    expect(onTypography).not.toHaveBeenCalled();
    expect(onSubjectColorMode).not.toHaveBeenCalled();
    expect(onBackground).not.toHaveBeenCalled();
  });

  it("selects a compact paired typography option with a non-color selected state", () => {
    const project = visualScheduleProject();
    const onTypography = vi.fn();
    render(
      <DesignStudioPanel
        design={project.design}
        visibleFields={project.design.visibleFields}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities(
          "minimal",
          project.deviceVariants[0]!,
        )}
        onTypography={onTypography}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("ScheduleBud", { selector: "summary span" }),
    );
    const option = screen.getByRole("radio", {
      name: /Playfair Display \+ Inter/,
    });
    fireEvent.click(option);
    expect(onTypography).toHaveBeenCalledWith("playfair-inter");
    expect(screen.getByRole("radio", { name: /ScheduleBud/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("shows only contextual styles and hides the one-option Polaroid control", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onStyle = vi.fn();
    const common = {
      visibleFields: project.design.visibleFields,
      detailCapabilities: resolveLayoutDetailCapabilities("cards", variant),
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...common}
        design={project.design}
        activeLayout="cards"
        onStyle={onStyle}
      />,
    );
    for (const name of ["Soft", "Outline", "Bold", "Glass"])
      expect(screen.getByRole("radio", { name })).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Glass" }));
    expect(onStyle).toHaveBeenCalledWith("cards-glass");

    rerender(
      <DesignStudioPanel
        {...common}
        design={{ ...project.design, layoutId: "photo" }}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photoComposition="polaroid"
        onStyle={onStyle}
      />,
    );
    expect(
      screen.queryByRole("radiogroup", { name: "photo layout style" }),
    ).toBeNull();
  });

  it("browses built-in stickers and exposes compact selected-instance controls", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onAdd = vi.fn();
    const onMenu = vi.fn();
    const instance = {
      instanceId: "sticker-one",
      stickerId: "capy-reading",
      xRatio: 0.5,
      yRatio: 0.5,
      widthRatio: 0.22,
      rotation: 0,
      layer: "in-front" as const,
      order: 0,
    };
    render(
      <DesignStudioPanel
        design={project.design}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
        stickers={[instance]}
        selectedStickerId={instance.instanceId}
        onStickerAdd={onAdd}
        onStickerMenu={onMenu}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add sticker" }));
    expect(screen.getByRole("tab", { name: "Capybara" })).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "Emojis" }));
    expect(
      screen.getByRole("tab", { name: "Smileys & Emotion" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "People & Body" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Animals & Nature" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Food & Drink" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Travel & Places" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Activities" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Objects" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Symbols" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Flags" })).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /^Add (?!sticker$)/ }),
    ).toHaveLength(60);
    fireEvent.click(screen.getByRole("button", { name: /Show more/ }));
    expect(
      screen.getAllByRole("button", { name: /^Add (?!sticker$)/ }),
    ).toHaveLength(120);
    fireEvent.click(screen.getByRole("tab", { name: "Food & Drink" }));
    expect(
      screen.getAllByRole("button", { name: /^Add (?!sticker$)/ }),
    ).toHaveLength(60);
    expect(
      screen.getByRole("button", { name: /Show more \(70 remaining\)/ }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "Flags" }));
    expect(
      screen.getAllByRole("button", { name: /^Add (?!sticker$)/ }),
    ).toHaveLength(8);
    expect(screen.queryByRole("button", { name: /Show more/ })).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Search stickers" }), {
      target: { value: "school" },
    });
    expect(
      screen.getByText("Searching all emoji categories and metadata"),
    ).toBeVisible();
    expect(
      screen
        .getAllByRole("button", { name: /^Add (?!sticker$)/ })
        .slice(0, 4)
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Add Graduation Cap", "Add Books", "Add Pencil", "Add Memo"]);
    fireEvent.change(screen.getByRole("textbox", { name: "Search stickers" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Capybara" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Add Reading Capybara" }),
    );
    expect(onAdd).toHaveBeenCalledWith("capy-reading");
    expect(screen.getByText("In front")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Delete sticker/ })).toBeNull();
    const moreButton = screen.getByRole("button", {
      name: "More actions for Reading Capybara",
    });
    fireEvent.click(moreButton);
    expect(onMenu).toHaveBeenCalledWith(
      instance.instanceId,
      { x: 0, y: 0 },
      moreButton,
    );
  });

  it("keeps the active Color Palette compact and opens the full choice list on demand", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onTheme = vi.fn();
    const { rerender } = render(
      <DesignStudioPanel
        design={project.design}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
        onTheme={onTheme}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    const paletteSummary = screen
      .getByText("Clean Slate", { selector: "summary span" })
      .closest("summary")!;
    expect(paletteSummary).toBeVisible();
    expect(screen.getByText("Malinis")).toBeVisible();
    const paletteDetails = paletteSummary.closest("details")!;
    const paletteChoices = screen.getByRole("radiogroup", {
      name: "Color palette",
    });
    expect(paletteDetails).not.toHaveAttribute("open");
    expect(paletteChoices).not.toBeVisible();
    fireEvent.click(paletteSummary);
    expect(paletteDetails).toHaveAttribute("open");
    expect(paletteChoices).toBeVisible();
    expect(screen.getByRole("radio", { name: "Clean Slate" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const adzu = screen.getByRole("radio", { name: /AdZU Classic/ });
    const midnight = screen.getByRole("radio", { name: /Midnight/ });
    const siteao = screen.getByRole("radio", { name: "SITEAO" });
    const laao = screen.getByRole("radio", { name: "LAAO" });
    const eao = screen.getByRole("radio", { name: "EAO" });
    const mao = screen.getByRole("radio", { name: "MAO" });
    const aao = screen.getByRole("radio", { name: "AAO" });
    const nao = screen.getByRole("radio", { name: "NAO" });
    const matcha = screen.getByRole("radio", { name: "Matcha Study" });
    const girlfriendsChoice = screen.getByRole("radio", {
      name: "Girlfriend's Choice",
    });
    const pinkDiary = screen.getByRole("radio", { name: "Pink Diary" });
    const custom = within(
      screen.getByRole("radiogroup", { name: "Color palette" }),
    ).getByRole("radio", { name: "Custom" });
    expect(
      screen.getByRole("heading", { name: "Color Palette" }),
    ).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Theme" })).toBeNull();
    expect(adzu).toHaveAttribute("aria-checked", "false");
    expect(midnight).toHaveAttribute("aria-checked", "false");
    expect(siteao).toHaveAttribute("aria-checked", "false");
    expect(laao).toHaveAttribute("aria-checked", "false");
    expect(eao).toHaveAttribute("aria-checked", "false");
    expect(mao).toHaveAttribute("aria-checked", "false");
    expect(aao).toHaveAttribute("aria-checked", "false");
    expect(nao).toHaveAttribute("aria-checked", "false");
    expect(matcha).toHaveAttribute("aria-checked", "false");
    expect(girlfriendsChoice).toHaveAttribute("aria-checked", "false");
    expect(pinkDiary).toHaveAttribute("aria-checked", "false");
    expect(custom).toHaveAttribute("aria-checked", "false");
    fireEvent.click(pinkDiary);
    expect(onTheme).toHaveBeenCalledOnce();
    expect(onTheme).toHaveBeenCalledWith("pink-diary");
    expect(paletteDetails).not.toHaveAttribute("open");
    expect(paletteChoices).not.toBeVisible();
    rerender(
      <DesignStudioPanel
        design={{ ...project.design, themeId: "pink-diary" }}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
        onTheme={onTheme}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Pink Diary", { selector: "summary span" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "For schedules that deserve a little main-character energy.",
      ),
    ).toBeVisible();
  });

  it("opens palette customization without selecting Custom and applies only valid HEX", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onTheme = vi.fn();
    const onColor = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, themeId: "matcha-study" }}
        visibleFields={project.design.visibleFields}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities("minimal", variant)}
        onTheme={onTheme}
        onCustomPaletteColor={onColor}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Customize palette"));
    expect(onTheme).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Canvas HEX")).toHaveValue("#F5F3E9");
    expect(screen.getByLabelText("Accent HEX")).toHaveValue("#8FA276");
    fireEvent.change(screen.getByLabelText("Accent HEX"), {
      target: { value: "#12" },
    });
    expect(onColor).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Accent HEX"), {
      target: { value: "#a1b2c3" },
    });
    expect(onColor).toHaveBeenCalledWith("accent", "#A1B2C3");
  });

  it("bounds picker preview updates and flushes the final dragged color", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onPreview = vi.fn();
    const onStart = vi.fn();
    const onEnd = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, themeId: "matcha-study" }}
        visibleFields={project.design.visibleFields}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities("minimal", variant)}
        onCustomPalettePickerPreview={onPreview}
        onCustomPalettePickerStart={onStart}
        onCustomPalettePickerEnd={onEnd}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Customize palette"));
    const picker = screen.getByLabelText("Accent color picker");
    fireEvent.focus(picker);
    fireEvent.input(picker, { target: { value: "#111111" } });
    fireEvent.input(picker, { target: { value: "#222222" } });
    fireEvent.input(picker, { target: { value: "#333333" } });
    expect(onPreview).not.toHaveBeenCalled();
    fireEvent.blur(picker);
    expect(onStart).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledWith("accent", "#333333");
  });

  it("shows the Custom base, reset action, and base Subject palette", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onReset = vi.fn();
    render(
      <DesignStudioPanel
        design={{
          ...project.design,
          themeId: "custom",
          customPalette: {
            basedOnPaletteId: "pink-diary",
            canvas: "#111111",
            primary: "#222222",
            secondary: "#333333",
            accent: "#444444",
            surface: "#555555",
            border: "#666666",
          },
        }}
        visibleFields={project.design.visibleFields}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
        onResetCustomPalette={onReset}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByText("Based on Pink Diary")).toBeVisible();
    expect(
      screen.getByLabelText("Pink Diary automatic subject colors"),
    ).toBeVisible();
    fireEvent.click(screen.getByText("Customize palette"));
    fireEvent.click(
      screen.getByRole("button", { name: "Reset to Pink Diary" }),
    );
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("keeps the Pink Diary subject palette visible only for Cards and Grid", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const props = {
      design: { ...project.design, themeId: "pink-diary" as const },
      visibleFields: project.design.visibleFields,
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...props}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
      />,
    );

    expect(
      screen.getByLabelText("Pink Diary automatic subject colors"),
    ).toBeVisible();
    rerender(
      <DesignStudioPanel
        {...props}
        activeLayout="grid"
        detailCapabilities={resolveLayoutDetailCapabilities("grid", variant)}
      />,
    );
    expect(
      screen.getByLabelText("Pink Diary automatic subject colors"),
    ).toBeVisible();

    for (const layoutId of ["minimal", "planner", "photo"] as const) {
      rerender(
        <DesignStudioPanel
          {...props}
          activeLayout={layoutId}
          detailCapabilities={resolveLayoutDetailCapabilities(
            layoutId,
            variant,
          )}
        />,
      );
      expect(
        screen.queryByLabelText("Pink Diary automatic subject colors"),
      ).toBeNull();
    }
  });

  it("keeps the Girlfriend's Choice subject palette visible only for Cards and Grid", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const props = {
      design: { ...project.design, themeId: "girlfriends-choice" as const },
      visibleFields: project.design.visibleFields,
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...props}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
      />,
    );

    expect(
      screen.getByLabelText("Girlfriend's Choice automatic subject colors"),
    ).toBeVisible();
    rerender(
      <DesignStudioPanel
        {...props}
        activeLayout="grid"
        detailCapabilities={resolveLayoutDetailCapabilities("grid", variant)}
      />,
    );
    expect(
      screen.getByLabelText("Girlfriend's Choice automatic subject colors"),
    ).toBeVisible();

    for (const layoutId of ["minimal", "planner", "photo"] as const) {
      rerender(
        <DesignStudioPanel
          {...props}
          activeLayout={layoutId}
          detailCapabilities={resolveLayoutDetailCapabilities(
            layoutId,
            variant,
          )}
        />,
      );
      expect(
        screen.queryByLabelText("Girlfriend's Choice automatic subject colors"),
      ).toBeNull();
    }
  });

  it("keeps the Matcha subject palette visible only for Cards and Grid", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const props = {
      design: { ...project.design, themeId: "matcha-study" as const },
      visibleFields: project.design.visibleFields,
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel
        {...props}
        activeLayout="cards"
        detailCapabilities={resolveLayoutDetailCapabilities("cards", variant)}
      />,
    );

    expect(
      screen.getByLabelText("Matcha Study automatic subject colors"),
    ).toBeVisible();
    rerender(
      <DesignStudioPanel
        {...props}
        activeLayout="grid"
        detailCapabilities={resolveLayoutDetailCapabilities("grid", variant)}
      />,
    );
    expect(
      screen.getByLabelText("Matcha Study automatic subject colors"),
    ).toBeVisible();

    for (const layoutId of ["minimal", "planner", "photo"] as const) {
      rerender(
        <DesignStudioPanel
          {...props}
          activeLayout={layoutId}
          detailCapabilities={resolveLayoutDetailCapabilities(
            layoutId,
            variant,
          )}
        />,
      );
      expect(
        screen.queryByLabelText("Matcha Study automatic subject colors"),
      ).toBeNull();
    }
  });

  it("keeps Midnight Subject Palette visibility layout-dependent", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const props = {
      design: { ...project.design, themeId: "midnight" as const },
      visibleFields: project.design.visibleFields,
      detailCapabilities: resolveLayoutDetailCapabilities("cards", variant),
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
    };
    const { rerender } = render(
      <DesignStudioPanel {...props} activeLayout="cards" />,
    );

    expect(
      screen.getByLabelText("Midnight automatic subject colors"),
    ).toBeVisible();
    rerender(
      <DesignStudioPanel
        {...props}
        activeLayout="minimal"
        detailCapabilities={resolveLayoutDetailCapabilities("minimal", variant)}
      />,
    );
    expect(
      screen.queryByLabelText("Midnight automatic subject colors"),
    ).toBeNull();
  });

  it("keeps Planner in the compact selector and hides Subject Palette", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "planner" }}
        visibleFields={project.design.visibleFields}
        activeLayout="planner"
        detailCapabilities={resolveLayoutDetailCapabilities("planner", variant)}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    const planner = screen.getByRole("radio", { name: "Planner" });
    expect(planner).toHaveAttribute("aria-checked", "true");
    expect(planner).toHaveClass("min-w-0", "px-1");
    expect(
      screen.queryByLabelText("Clean Slate automatic subject colors"),
    ).toBeNull();
  });

  it("selects Photo, shows its local asset action, and hides Subject Palette", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onComposition = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        onPhotoComposition={onComposition}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "Photo" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("button", { name: "Add photo" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "hero" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "split" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "polaroid" })).toBeVisible();
    const compositionHeading = screen.getByRole("heading", {
      name: "Composition",
    });
    const photosHeading = screen.getByRole("heading", { name: "Photos" });
    const styleHeading = screen.getByRole("heading", { name: "Style" });
    expect(
      compositionHeading.compareDocumentPosition(photosHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      compositionHeading.compareDocumentPosition(styleHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      styleHeading.compareDocumentPosition(photosHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "split" }));
    expect(onComposition).toHaveBeenCalledWith("split");
    expect(screen.getByText("Previewing an empty photo frame")).toBeVisible();
    expect(screen.getByLabelText("Choose Photo")).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp",
    );
    expect(
      screen.queryByLabelText("Clean Slate automatic subject colors"),
    ).toBeNull();
  });

  it("preserves the original Photo filename and shows the adjust helper", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const filename = "917c2a09-de4d-4d5e-b474-c068d2d3e069.jpg";
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[{ id: "internal-asset-id", filename, caption: "" }]}
        activePhotoId="internal-asset-id"
        photoAdjusting
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    expect(screen.getByText(filename)).toHaveAttribute("title", filename);
    expect(screen.getByText("Drag the photo to reposition")).toBeVisible();
    expect(screen.getByLabelText("Photo composition")).toBeVisible();
    expect(screen.queryByText("internal-asset-id")).toBeNull();
  });

  it("shows visual proof and metadata for a received photo", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const { container } = render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          {
            id: "photo-preview",
            filename: "campus-sunset.png",
            caption: "",
            previewUrl: "data:image/png;base64,iVBORw0KGgo=",
            mimeType: "image/png",
            size: 2048,
            width: 1200,
            height: 800,
          },
        ]}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(screen.getByText("campus-sunset.png")).toBeVisible();
    expect(screen.getByText("PNG · 2.0 KB")).toBeVisible();
    expect(screen.getByText("1200 × 800 px")).toBeVisible();
    expect(screen.getByText("Ready")).toBeVisible();
    expect(
      container.querySelector('img[src^="data:image/png"]'),
    ).not.toBeNull();
  });

  it("reacts to photo drag-and-drop and receives the dropped file", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onPhotoFile = vi.fn().mockResolvedValue(undefined);
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        onPhotoFile={onPhotoFile}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    const zone = screen.getByLabelText("Add your main photo drop zone");
    expect(zone).toHaveAttribute("role", "group");
    const file = new File(["image"], "friends.webp", {
      type: "image/webp",
    });

    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(zone).toHaveAttribute("data-dragging", "true");
    expect(screen.getByText("Release to add this image")).toBeVisible();
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onPhotoFile).toHaveBeenCalledWith(file, "replace-primary");
    expect(zone).toHaveAttribute("data-dragging", "false");
  });

  it("explains the animated empty Polaroid preview", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photoComposition="polaroid"
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Preview cycles through 1–4-photo Polaroid layouts"),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: "polaroid" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("offers Hero, Split, and Polaroid in the compact Photo composition control", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onComposition = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "asset-id", filename: "semester-photo.jpg", caption: "" },
        ]}
        activePhotoId="asset-id"
        photoComposition="hero"
        onPhotoComposition={onComposition}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );
    const hero = screen.getByRole("radio", { name: "hero" });
    const split = screen.getByRole("radio", { name: "split" });
    const polaroid = screen.getByRole("radio", { name: "polaroid" });
    expect(hero).toHaveAttribute("aria-checked", "true");
    expect(split).toHaveAttribute("aria-checked", "false");
    expect(polaroid).toHaveAttribute("aria-checked", "false");
    fireEvent.click(split);
    expect(onComposition).toHaveBeenCalledWith("split");
  });

  it("manages a compact ordered four-photo Polaroid collection", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onMove = vi.fn();
    const onCaption = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "one", filename: "one.jpg", caption: "first week" },
          { id: "two", filename: "two.jpg", caption: "" },
          { id: "three", filename: "three.jpg", caption: "" },
          { id: "four", filename: "four.jpg", caption: "" },
        ]}
        activePhotoId="one"
        photoComposition="polaroid"
        onPhotoMove={onMove}
        onPhotoCaption={onCaption}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(screen.getByText("Maximum 4 photos")).toBeVisible();
    expect(
      screen.getByText("4 of 4 photos · Looks best with 3–4"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "+ Add photo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move photo 2 up" }));
    expect(onMove).toHaveBeenCalledWith("two", "up");
    const caption = screen.getAllByLabelText("Caption (optional)")[0]!;
    fireEvent.change(caption, { target: { value: "semester memories" } });
    fireEvent.blur(caption);
    expect(onCaption).toHaveBeenCalledWith("one", "semester memories");
  });

  it("presents one to four Polaroid photos as valid", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "one", filename: "one.jpg", caption: "" },
          { id: "two", filename: "two.jpg", caption: "" },
        ]}
        activePhotoId="one"
        photoComposition="polaroid"
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(
      screen.getByText("2 of 4 photos · Looks best with 3–4"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "+ Add photo" })).toBeEnabled();
  });

  it("reuses ordered photo management for Split without caption fields", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onMove = vi.fn();
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photos={[
          { id: "one", filename: "one.jpg", caption: "keep me" },
          { id: "two", filename: "two.jpg", caption: "" },
        ]}
        activePhotoId="two"
        photoComposition="split"
        onPhotoMove={onMove}
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(screen.getByText("2 of 4 photos")).toBeVisible();
    expect(screen.getAllByText("Photos")).toHaveLength(1);
    expect(screen.getByText("1. one.jpg")).toBeVisible();
    expect(screen.getByText("2. two.jpg")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Adjust" })).toHaveLength(2);
    expect(screen.queryByLabelText("Caption (optional)")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Move photo 2 up" }));
    expect(onMove).toHaveBeenCalledWith("two", "up");
  });

  it("explains the animated empty Split mosaic preview", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    render(
      <DesignStudioPanel
        design={{ ...project.design, layoutId: "photo" }}
        visibleFields={project.design.visibleFields}
        activeLayout="photo"
        detailCapabilities={resolveLayoutDetailCapabilities("photo", variant)}
        photoComposition="split"
        onLayout={vi.fn()}
        onTitleVisible={vi.fn()}
        onTitleText={vi.fn()}
        onField={vi.fn()}
        onDayVisibility={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Preview cycles through 1–4-photo Split mosaics"),
    ).toBeVisible();
  });

  it("offers compact accessible Background modes and contextual controls", () => {
    const project = visualScheduleProject();
    const variant = project.deviceVariants[0]!;
    const onMode = vi.fn();
    const onBackground = vi.fn();
    const onImageCenter = vi.fn();
    const onImageReset = vi.fn();
    const common = {
      visibleFields: project.design.visibleFields,
      activeLayout: "cards" as const,
      detailCapabilities: resolveLayoutDetailCapabilities("cards", variant),
      onLayout: vi.fn(),
      onTitleVisible: vi.fn(),
      onTitleText: vi.fn(),
      onField: vi.fn(),
      onDayVisibility: vi.fn(),
      onBackgroundMode: onMode,
      onBackground,
      onBackgroundImageCenter: onImageCenter,
      onBackgroundImageReset: onImageReset,
    };
    const { rerender } = render(
      <DesignStudioPanel {...common} design={project.design} />,
    );
    for (const name of ["Palette", "Solid", "Gradient", "Pattern", "Image"])
      expect(screen.getByRole("radio", { name })).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Solid" }));
    expect(onMode).toHaveBeenCalledWith("solid");
    expect(screen.getByText(/Uses Clean Slate canvas/)).toBeVisible();

    rerender(
      <DesignStudioPanel
        {...common}
        design={{
          ...project.design,
          background: {
            mode: "gradient",
            gradient: {
              color1: "#112233",
              color2: "#AABBCC",
              direction: 0,
            },
          },
        }}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "Gradient direction" }),
    ).toBeVisible();
    expect(screen.getByText("To right")).toBeVisible();
    const leftToRight = screen.getByRole("radio", {
      name: "Left to right",
    });
    expect(leftToRight).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(leftToRight, { key: "ArrowRight" });
    expect(onBackground).toHaveBeenLastCalledWith(
      expect.objectContaining({
        gradient: expect.objectContaining({ direction: 45 }),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reset Gradient background" }),
    );
    expect(onBackground).toHaveBeenLastCalledWith(
      expect.objectContaining({
        gradient: {
          color1: "#F7F8FA",
          color2: "#FFFFFF",
          direction: 135,
        },
      }),
    );

    rerender(
      <DesignStudioPanel
        {...common}
        design={{
          ...project.design,
          background: {
            mode: "pattern",
            pattern: {
              type: "emoji",
              backgroundColor: "#FFFFFF",
              emojiId: "fluent-1f600",
              size: 0.05,
              spacing: 0.1,
              opacity: 0.7,
              rotation: 0,
              layout: "grid",
            },
          },
        }}
      />,
    );
    expect(screen.getByRole("radio", { name: "Emoji" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByLabelText("Size")).toBeVisible();
    expect(
      screen.getByRole("radiogroup", { name: "Emoji layout" }),
    ).toBeVisible();
    expect(screen.queryByText("Dot color")).toBeNull();
    for (const type of ["dots", "grid", "checker", "diagonal", "emoji"])
      expect(screen.getByTestId(`pattern-preview-${type}`)).toBeVisible();

    rerender(
      <DesignStudioPanel
        {...common}
        backgroundImageFilename="campus.png"
        backgroundImageAdjusting
        backgroundImageZoom={1.35}
        design={{
          ...project.design,
          background: {
            mode: "image",
            image: {
              assetId: "background-one",
              overlay: "dark",
              overlayIntensity: 0.35,
            },
          },
        }}
      />,
    );
    expect(screen.getByText("Adjusting background")).toBeVisible();
    expect(screen.getByText("135%")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Center image" }));
    expect(onImageCenter).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: "Reset Image background" }),
    );
    expect(onImageReset).toHaveBeenCalledOnce();
    expect(onBackground).toHaveBeenLastCalledWith(
      expect.objectContaining({
        image: expect.objectContaining({
          overlay: "none",
          overlayIntensity: 0,
        }),
      }),
    );
  });
});
