import { region, config, logger } from "firebase-functions";
import { Telegraf } from "telegraf";

const prohibitedWords = ["t.me/", "drug", "weed", "hooker"];

const bot = new Telegraf(config().telegram.token, {
	telegram: { webhookReply: true }
});

bot.on("text", async (ctx) => {
	if (isMessageProhibited(ctx.message.text)) {
		await ctx.deleteMessage();
		await ctx.sendMessage(
			`${ctx.message.from.username}'s message was deleted, due to containing prohibited words.`,
			{
				disable_notification: true
			}
		);
	}
});
bot.catch((error: unknown, context) => {
	logger.error("[Bot] Error", { error }, { context });
});

exports.telegramBot = region("europe-west1").https.onRequest(async (request, response) => {
	await bot.handleUpdate(request.body, response);

	response.status(200).send();

	return;
});

function isMessageProhibited(messageText: string): boolean {
	for (const word of prohibitedWords) {
		if (messageText.includes(word)) return true;
	}

	return false;
}
