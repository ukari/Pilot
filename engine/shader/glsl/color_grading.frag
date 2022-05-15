#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

highp ivec3 getLUTInfo(highp ivec2 lut_tex_size);

highp vec4[8] colorGradingLUTH(highp vec3 uvrgb, highp float COLORS, highp vec3 rgbfract);

highp vec4[8] colorGradingLUTV(highp vec3 uvrgb, highp float COLORS, highp vec3 rgbfract);

highp vec4[8] colorGradingLUTS(highp vec3 uvrgb, highp float COLORS, highp float SQRT_COLORS, highp vec3 rgbfract);

highp vec4 triLerp(highp vec4[8] cp, highp vec3 rgbfract);

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    /*
    highp float COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;
    
    highp vec3 uvrgb = color.rgb * (COLORS - 1.0f);
    
    highp vec3 rgbfloor = floor(uvrgb);
    highp vec3 rgbfract = fract(uvrgb);
    highp vec3 rgbstep = ceil(rgbfract);
    //highp vec3 rgbceil = ceil(uvrgb);
    highp vec4[8] cp;

    for (int i = 0; i < 8; i += 1) {
        highp vec3 tmp = rgbfloor + rgbstep * vec3(i & 1, (i & 2) >> 1, (i & 4) >> 2);
        highp vec2 delta = vec2(tmp.b / COLORS, 0.0f);
        highp vec2 uv = (tmp.rg / vec2((COLORS - 1.0f) * COLORS, COLORS - 1.0f)) + delta;
        cp[i] = texture(color_grading_lut_texture_sampler, uv);
    }

    highp vec4[2] prg;

    for (int i = 0; i < 2; i += 1) {
        int j = 4 * i;
        highp vec4 pr0 = mix(cp[0 + j], cp[1 + j], rgbfract.r);
        highp vec4 pr1 = mix(cp[2 + j], cp[3 + j], rgbfract.r);
        prg[i] = mix(pr0, pr1, rgbfract.g);
    }
    highp vec4 prgb = mix(prg[0], prg[1], rgbfract.b);
    
    //highp float r = mix(cp[0].r, cp[7].r, rgbfract.r);
    //highp float g = mix(cp[0].g, cp[7].g, rgbfract.g);
    //highp float b = mix(cp[0].b, cp[7].b, rgbfract.b);
    
    //highp vec4 res1 = texture(color_grading_lut_texture_sampler, vec2(color.r / COLORS + (floor(color.b * (COLORS - 1.0f)) / COLORS), color.g));
    //highp vec4 res2 = texture(color_grading_lut_texture_sampler, vec2(color.r / COLORS + (ceil(color.b * (COLORS - 1.0f)) / COLORS), color.g));
    //out_color = mix(res1, res2, fract(color.b * (COLORS - 1.0f)));
    //out_color = vec4(r, g, b, 1.0f);//texture(color_grading_lut_texture_sampler, (floor(color.rg) + fract(color.rg) + vec2((floor(color.b) + fract(color.b)) * 16.0f, 0.0f)) / vec2(16.0f, 1.0f));//prgb;
    */
    
    highp ivec3 lut_info = getLUTInfo(lut_tex_size);
    highp float COLORS = float(lut_info.y);
    highp vec4 color = subpassLoad(in_color).rgba;
    highp vec3 uvrgb = clamp(color.rgb * (COLORS - 1.0f), 0.0f, COLORS - 1.0f);
    
    highp vec3 rgbfract = fract(uvrgb);
    highp vec4[8] cp;
    if (lut_info.x == 0) {
        cp = colorGradingLUTH(uvrgb, COLORS, rgbfract);
    } else if (lut_info.x == 1) {
        cp = colorGradingLUTV(uvrgb, COLORS, rgbfract);
    } else if (lut_info.x == 2){
        cp = colorGradingLUTS(uvrgb, COLORS, float(lut_info.z), rgbfract);
    } else {
      // unsupport lut
      out_color = vec4(1.0f);
      return;
    }
    highp vec4 prgb = triLerp(cp, rgbfract);
    out_color = vec4(prgb.rgba);

}

highp ivec3 getLUTInfo(highp ivec2 lut_tex_size) {
    if (lut_tex_size.x / lut_tex_size.y == lut_tex_size.y) {
        return ivec3(0, lut_tex_size.y, 0);
    } else if (lut_tex_size.y / lut_tex_size.x == lut_tex_size.x) {
        return ivec3(1, lut_tex_size.x, 0);
    } else if (lut_tex_size.x == lut_tex_size.y) {
        highp int SQRT_COLORS = int(pow(float(lut_tex_size.x), 1.0f / 3.0f)); 
        return ivec3(2, SQRT_COLORS * SQRT_COLORS, SQRT_COLORS);
    } else {
        return ivec3(3, 0, 0);
    }
}

highp vec4[8] colorGradingLUTH(highp vec3 uvrgb, highp float COLORS, highp vec3 rgbfract) {
    highp vec3 rgbfloor = floor(uvrgb);
    highp vec3 rgbstep = ceil(rgbfract);
    highp vec4[8] cp;
    //highp float XRANGE = COLORS * COLORS - 1.0f;
    for (int i = 0; i < 8; i += 1) {
        highp vec3 tmp = rgbfloor + rgbstep * vec3(i & 1, (i & 2) >> 1, (i & 4) >> 2);
        highp vec2 delta = vec2(tmp.b * COLORS, 0.0f);
        //highp vec2 uv = (tmp.rg / vec2((COLORS * COLORS - 1.0f), COLORS - 1.0f)) + delta;
        highp vec2 uv = (tmp.rg + delta + vec2(0.5f)) / vec2(COLORS * COLORS, COLORS);
        cp[i] = texture(color_grading_lut_texture_sampler, uv);
    }
    return cp;
}

highp vec4[8] colorGradingLUTV(highp vec3 uvrgb, highp float COLORS, highp vec3 rgbfract) {
    highp vec3 rgbfloor = floor(uvrgb);
    highp vec3 rgbstep = ceil(rgbfract);
    highp vec4[8] cp;
    highp float YRANGE = COLORS * COLORS - 1.0f;
    for (int i = 0; i < 8; i += 1) {
        highp vec3 tmp = rgbfloor + rgbstep * vec3(i & 1, (i & 2) >> 1, (i & 4) >> 2);
        highp vec2 delta = vec2(0.0f, tmp.b * COLORS);
        highp vec2 uv = (tmp.rg + delta + vec2(0.5f)) / vec2(COLORS, COLORS * COLORS);
        cp[i] = texture(color_grading_lut_texture_sampler, uv);
    }
    return cp;
}

highp vec4[8] colorGradingLUTS(highp vec3 uvrgb, highp float COLORS, highp float SQRT_COLORS, highp vec3 rgbfract) {
    highp vec3 rgbfloor = floor(uvrgb);
    highp vec3 rgbstep = ceil(rgbfract);
    highp vec4[8] cp;
    for (int i = 0; i < 8; i += 1) {
        highp vec3 tmp = rgbfloor + rgbstep * vec3(i & 1, (i & 2) >> 1, (i & 4) >> 2);
        highp vec2 delta = vec2(mod(tmp.b, SQRT_COLORS) * COLORS, floor(tmp.b / SQRT_COLORS) * COLORS);
        highp vec2 uv = (tmp.rg + delta + vec2(0.5f)) / vec2(COLORS * SQRT_COLORS);
        cp[i] = texture(color_grading_lut_texture_sampler, uv);
    }
    return cp;
}

highp vec4 triLerp(highp vec4[8] cp, highp vec3 rgbfract) {
    highp vec4[2] prg;

    for (int i = 0; i < 2; i += 1) {
        int j = 4 * i;
        highp vec4 pr0 = mix(cp[0 + j], cp[1 + j], rgbfract.r);
        highp vec4 pr1 = mix(cp[2 + j], cp[3 + j], rgbfract.r);
        prg[i] = mix(pr0, pr1, rgbfract.g);
    }
    return mix(prg[0], prg[1], rgbfract.b);
}
